import os
import urllib.request

files = {
    "libs/three.module.js": "https://unpkg.com/three@0.129.0/build/three.module.js",
    "libs/jsm/loaders/GLTFLoader.js": "https://unpkg.com/three@0.129.0/examples/jsm/loaders/GLTFLoader.js",
    "libs/jsm/controls/OrbitControls.js": "https://unpkg.com/three@0.129.0/examples/jsm/controls/OrbitControls.js",
    "libs/jsm/renderers/CSS3DRenderer.js": "https://unpkg.com/three@0.129.0/examples/jsm/renderers/CSS3DRenderer.js",
    "libs/jsm/postprocessing/EffectComposer.js": "https://unpkg.com/three@0.129.0/examples/jsm/postprocessing/EffectComposer.js",
    "libs/jsm/postprocessing/RenderPass.js": "https://unpkg.com/three@0.129.0/examples/jsm/postprocessing/RenderPass.js",
    "libs/jsm/postprocessing/UnrealBloomPass.js": "https://unpkg.com/three@0.129.0/examples/jsm/postprocessing/UnrealBloomPass.js",
    "libs/jsm/postprocessing/Pass.js": "https://unpkg.com/three@0.129.0/examples/jsm/postprocessing/Pass.js",
    "libs/jsm/postprocessing/ShaderPass.js": "https://unpkg.com/three@0.129.0/examples/jsm/postprocessing/ShaderPass.js",
    "libs/jsm/postprocessing/MaskPass.js": "https://unpkg.com/three@0.129.0/examples/jsm/postprocessing/MaskPass.js",
    "libs/jsm/shaders/CopyShader.js": "https://unpkg.com/three@0.129.0/examples/jsm/shaders/CopyShader.js",
    "libs/jsm/shaders/LuminosityHighPassShader.js": "https://unpkg.com/three@0.129.0/examples/jsm/shaders/LuminosityHighPassShader.js"
}

print("Starting downloads...")
for path, url in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    try:
        print(f"Downloading {path}...")
        urllib.request.urlretrieve(url, path)
        print("OK")
    except Exception as e:
        print(f"FAILED {path}: {e}")

print("Done.")
