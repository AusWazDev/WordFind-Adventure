{
  "targets": [
    {
      "target_name": "windows_store",
      "sources": ["src/windows_store.cpp"],
      "defines": ["NAPI_VERSION=8", "WIN32_LEAN_AND_MEAN", "NOMINMAX", "UNICODE", "_UNICODE"],
      "libraries": ["windowsapp.lib", "ole32.lib"],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "ExceptionHandling": 1,
          "AdditionalOptions": ["/std:c++20", "/bigobj", "/permissive-"]
        }
      }
    }
  ]
}
