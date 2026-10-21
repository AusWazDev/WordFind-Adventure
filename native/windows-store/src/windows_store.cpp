// SoundFind's Microsoft Store bridge (S25, SF-75). A C++/WinRT addon behind the C
// Node-API (ABI-stable, so it is built once and loads in any Electron with the same
// Node-API version).
//
// Loaded by the Electron MAIN process only (electron/main.cjs). Four calls:
//   init(hwndBuffer)                  -> { ok, hresult }
//   getProducts()                     -> Promise<{ ok, hresult, products: [{ storeId, offerToken, title, price }] }>
//   purchase(storeId)                 -> Promise<{ ok, hresult, status }>
//   reportFulfillment(storeId, guid)  -> Promise<{ ok, hresult, status }>
//
// Decisions this follows (SF-75 A, from Microsoft's documentation):
// - StoreContext::GetDefault(), then the owner window set ONCE through
//   IInitializeWithWindow (Microsoft: a desktop app "must configure the StoreContext
//   object to specify which application window is the owner window").
// - RequestPurchaseAsync "must be called on the UI thread": every call here is made on
//   the thread that calls the addon, Electron's main thread, which owns the window.
// - C++/WinRT must not block on a UI thread, so nothing calls .get(). Each operation
//   reports through its Completed handler, which hands the result back to JavaScript
//   through a thread-safe function; the promise is settled on the JavaScript thread.
// - Nothing here decides what a failure means: every result carries the status and
//   the HRESULT, and the app treats any failure as "store unavailable".
#ifndef NAPI_VERSION
#define NAPI_VERSION 8
#endif
#include <node_api.h>

#include <windows.h>
#include <combaseapi.h>
#include <shobjidl_core.h>

#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Foundation.Collections.h>
#include <winrt/Windows.Services.Store.h>

#include <array>
#include <cstring>
#include <string>
#include <vector>

using namespace winrt;
using namespace winrt::Windows::Foundation;
using namespace winrt::Windows::Services::Store;

namespace {

// Held through a pointer that is never freed: a static StoreContext was released by
// its destructor during process exit, after the runtime it belongs to had gone, and
// the process ended with an access violation (seen in the SF-75 smoke run). The
// process reclaims everything at exit, so nothing is lost by not releasing it.
// (C++/WinRT forbids `new` on a projected type, so it sits inside a plain holder.)
struct ContextHolder { StoreContext context{ nullptr }; };
StoreContext* g_context = &(new ContextHolder())->context;

struct Product {
  std::string storeId, offerToken, title, price;
};

// One in-flight call. Owned by the call until the thread-safe function hands it to
// JavaScript, which deletes it after settling the promise.
struct Pending {
  napi_deferred deferred = nullptr;
  napi_threadsafe_function tsfn = nullptr;
  bool ok = false;        // the operation completed and its results were read
  int32_t hresult = 0;    // the operation's error, or the result's ExtendedError
  int32_t status = -1;    // StorePurchaseStatus or StoreConsumableStatus
  bool hasProducts = false;
  std::vector<Product> products;
};

void SetNamed(napi_env env, napi_value obj, const char* key, napi_value value) {
  napi_set_named_property(env, obj, key, value);
}

napi_value Bool(napi_env env, bool b) { napi_value v; napi_get_boolean(env, b, &v); return v; }
napi_value Int(napi_env env, int32_t i) { napi_value v; napi_create_int32(env, i, &v); return v; }
napi_value Str(napi_env env, const std::string& s) {
  napi_value v; napi_create_string_utf8(env, s.c_str(), s.size(), &v); return v;
}

// Runs on the JavaScript thread: settle the promise with a plain object, then free.
void CallJs(napi_env env, napi_value /*js_cb*/, void* /*context*/, void* data) {
  auto* p = static_cast<Pending*>(data);
  if (env != nullptr) {
    napi_value out;
    napi_create_object(env, &out);
    SetNamed(env, out, "ok", Bool(env, p->ok));
    SetNamed(env, out, "hresult", Int(env, p->hresult));
    SetNamed(env, out, "status", Int(env, p->status));
    if (p->hasProducts) {
      napi_value arr;
      napi_create_array_with_length(env, p->products.size(), &arr);
      for (size_t i = 0; i < p->products.size(); ++i) {
        napi_value item;
        napi_create_object(env, &item);
        SetNamed(env, item, "storeId", Str(env, p->products[i].storeId));
        SetNamed(env, item, "offerToken", Str(env, p->products[i].offerToken));
        SetNamed(env, item, "title", Str(env, p->products[i].title));
        SetNamed(env, item, "price", Str(env, p->products[i].price));
        napi_set_element(env, arr, static_cast<uint32_t>(i), item);
      }
      SetNamed(env, out, "products", arr);
    }
    // Always resolve: the caller reads ok/hresult/status. A rejection would lose them.
    napi_resolve_deferred(env, p->deferred, out);
  }
  delete p;
}

// Starts a call: a promise plus the thread-safe function its result comes back on.
Pending* Begin(napi_env env, napi_value* promise) {
  auto* p = new Pending();
  napi_create_promise(env, &p->deferred, promise);
  napi_value name;
  napi_create_string_utf8(env, "soundfind_store", NAPI_AUTO_LENGTH, &name);
  napi_create_threadsafe_function(env, nullptr, nullptr, name, 0, 1, nullptr, nullptr,
                                  nullptr, CallJs, &p->tsfn);
  return p;
}

// Hands a finished call to the JavaScript thread. Safe from any thread.
void Finish(Pending* p) {
  napi_threadsafe_function tsfn = p->tsfn;
  napi_call_threadsafe_function(tsfn, p, napi_tsfn_blocking);
  napi_release_threadsafe_function(tsfn, napi_tsfn_release);
}

// A call that cannot start (no context, a synchronous exception): settled at once.
napi_value FailNow(napi_env env, int32_t hresult) {
  napi_value promise;
  Pending* p = Begin(env, &promise);
  p->ok = false;
  p->hresult = hresult;
  Finish(p);
  return promise;
}

std::string ArgString(napi_env env, napi_value v) {
  size_t len = 0;
  if (napi_get_value_string_utf8(env, v, nullptr, 0, &len) != napi_ok) return {};
  std::string s(len, '\0');
  napi_get_value_string_utf8(env, v, s.data(), len + 1, &len);
  return s;
}

// init(hwndBuffer): GetDefault, then the owner window, once.
napi_value Init(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value argv[1];
  napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
  napi_value out;
  napi_create_object(env, &out);
  int32_t hr = 0;
  bool ok = false;
  try {
    HWND hwnd = nullptr;
    void* data = nullptr;
    size_t len = 0;
    if (argc >= 1 && napi_get_buffer_info(env, argv[0], &data, &len) == napi_ok) {
      if (len == 8) { uint64_t v; std::memcpy(&v, data, 8); hwnd = reinterpret_cast<HWND>(static_cast<uintptr_t>(v)); }
      else if (len == 4) { uint32_t v; std::memcpy(&v, data, 4); hwnd = reinterpret_cast<HWND>(static_cast<uintptr_t>(v)); }
    }
    // The main thread may already be in a COM apartment (Chromium); either answer is fine.
    CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    *g_context = StoreContext::GetDefault();
    auto initWithWindow = g_context->as<::IInitializeWithWindow>();
    check_hresult(initWithWindow->Initialize(hwnd));
    ok = hwnd != nullptr;
    if (!ok) hr = static_cast<int32_t>(E_INVALIDARG);
  } catch (hresult_error const& e) {
    hr = static_cast<int32_t>(e.code());
    *g_context = nullptr;
  } catch (...) {
    hr = static_cast<int32_t>(E_FAIL);
    *g_context = nullptr;
  }
  SetNamed(env, out, "ok", Bool(env, ok));
  SetNamed(env, out, "hresult", Int(env, hr));
  return out;
}

// getProducts(): the app's developer-managed consumables ("UnmanagedConsumable").
napi_value GetProducts(napi_env env, napi_callback_info /*info*/) {
  if (!*g_context) return FailNow(env, static_cast<int32_t>(E_ILLEGAL_METHOD_CALL));
  napi_value promise;
  Pending* p = Begin(env, &promise);
  try {
    auto kinds = single_threaded_vector<hstring>({ L"UnmanagedConsumable" });
    auto op = g_context->GetAssociatedStoreProductsAsync(kinds);
    op.Completed([p](IAsyncOperation<StoreProductQueryResult> const& done, AsyncStatus s) {
      try {
        if (s == AsyncStatus::Completed) {
          auto result = done.GetResults();
          p->hresult = static_cast<int32_t>(result.ExtendedError());
          p->hasProducts = true;
          for (auto const& kv : result.Products()) {
            auto product = kv.Value();
            p->products.push_back({ to_string(product.StoreId()), to_string(product.InAppOfferToken()),
                                    to_string(product.Title()), to_string(product.Price().FormattedPrice()) });
          }
          p->ok = true;
        } else {
          p->hresult = static_cast<int32_t>(done.ErrorCode());
        }
      } catch (hresult_error const& e) {
        p->ok = false;
        p->hresult = static_cast<int32_t>(e.code());
      } catch (...) {
        p->ok = false;
        p->hresult = static_cast<int32_t>(E_FAIL);
      }
      Finish(p);
    });
  } catch (hresult_error const& e) {
    p->hresult = static_cast<int32_t>(e.code());
    Finish(p);
  } catch (...) {
    p->hresult = static_cast<int32_t>(E_FAIL);
    Finish(p);
  }
  return promise;
}

// purchase(storeId): shows the Store's purchase UI, owned by the app window.
napi_value Purchase(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value argv[1];
  napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
  if (!*g_context || argc < 1) return FailNow(env, static_cast<int32_t>(E_ILLEGAL_METHOD_CALL));
  std::string storeId = ArgString(env, argv[0]);
  napi_value promise;
  Pending* p = Begin(env, &promise);
  try {
    auto op = g_context->RequestPurchaseAsync(to_hstring(storeId));
    op.Completed([p](IAsyncOperation<StorePurchaseResult> const& done, AsyncStatus s) {
      try {
        if (s == AsyncStatus::Completed) {
          auto result = done.GetResults();
          p->status = static_cast<int32_t>(result.Status());
          p->hresult = static_cast<int32_t>(result.ExtendedError());
          p->ok = true;
        } else {
          p->hresult = static_cast<int32_t>(done.ErrorCode());
        }
      } catch (hresult_error const& e) {
        p->ok = false;
        p->hresult = static_cast<int32_t>(e.code());
      } catch (...) {
        p->ok = false;
        p->hresult = static_cast<int32_t>(E_FAIL);
      }
      Finish(p);
    });
  } catch (hresult_error const& e) {
    p->hresult = static_cast<int32_t>(e.code());
    Finish(p);
  } catch (...) {
    p->hresult = static_cast<int32_t>(E_FAIL);
    Finish(p);
  }
  return promise;
}

// reportFulfillment(storeId, trackingGuid): quantity 1, as Microsoft requires for a
// developer-managed consumable. Retrying with the same pair is safe (Microsoft).
napi_value ReportFulfillment(napi_env env, napi_callback_info info) {
  size_t argc = 2;
  napi_value argv[2];
  napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
  if (!*g_context || argc < 2) return FailNow(env, static_cast<int32_t>(E_ILLEGAL_METHOD_CALL));
  std::string storeId = ArgString(env, argv[0]);
  std::string tracking = ArgString(env, argv[1]);
  GUID g{};
  std::wstring braced = L"{" + std::wstring(to_hstring(tracking)) + L"}";
  if (FAILED(CLSIDFromString(braced.c_str(), &g))) return FailNow(env, static_cast<int32_t>(E_INVALIDARG));
  winrt::guid trackingId(g.Data1, g.Data2, g.Data3,
                         std::array<uint8_t, 8>{ g.Data4[0], g.Data4[1], g.Data4[2], g.Data4[3],
                                                 g.Data4[4], g.Data4[5], g.Data4[6], g.Data4[7] });
  napi_value promise;
  Pending* p = Begin(env, &promise);
  try {
    auto op = g_context->ReportConsumableFulfillmentAsync(to_hstring(storeId), 1, trackingId);
    op.Completed([p](IAsyncOperation<StoreConsumableResult> const& done, AsyncStatus s) {
      try {
        if (s == AsyncStatus::Completed) {
          auto result = done.GetResults();
          p->status = static_cast<int32_t>(result.Status());
          p->hresult = static_cast<int32_t>(result.ExtendedError());
          p->ok = true;
        } else {
          p->hresult = static_cast<int32_t>(done.ErrorCode());
        }
      } catch (hresult_error const& e) {
        p->ok = false;
        p->hresult = static_cast<int32_t>(e.code());
      } catch (...) {
        p->ok = false;
        p->hresult = static_cast<int32_t>(E_FAIL);
      }
      Finish(p);
    });
  } catch (hresult_error const& e) {
    p->hresult = static_cast<int32_t>(e.code());
    Finish(p);
  } catch (...) {
    p->hresult = static_cast<int32_t>(E_FAIL);
    Finish(p);
  }
  return promise;
}

}  // namespace

NAPI_MODULE_INIT() {
  napi_property_descriptor props[] = {
    { "init", nullptr, Init, nullptr, nullptr, nullptr, napi_enumerable, nullptr },
    { "getProducts", nullptr, GetProducts, nullptr, nullptr, nullptr, napi_enumerable, nullptr },
    { "purchase", nullptr, Purchase, nullptr, nullptr, nullptr, napi_enumerable, nullptr },
    { "reportFulfillment", nullptr, ReportFulfillment, nullptr, nullptr, nullptr, napi_enumerable, nullptr },
  };
  napi_define_properties(env, exports, sizeof(props) / sizeof(props[0]), props);
  return exports;
}
