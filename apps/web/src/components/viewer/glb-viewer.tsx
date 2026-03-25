"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Grid,
  Center,
  Html,
  useProgress,
  Environment,
} from "@react-three/drei";
import { ErrorBoundary } from "./error-boundary";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          color: "white",
          textAlign: "center",
          whiteSpace: "nowrap",
          fontSize: "14px",
        }}
      >
        読み込み中... {Math.round(progress)}%
      </div>
    </Html>
  );
}

function ErrorFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
      <div className="p-6 text-center">
        <p className="mb-2 text-xl font-semibold">
          モデルの読み込みに失敗しました
        </p>
        <p className="text-sm text-slate-400">
          GLB ファイルが見つからないか、破損している可能性があります。
        </p>
        <p className="mt-2 text-sm text-slate-400">
          確認: <code className="text-slate-300">public/models/sample.glb</code>{" "}
          を配置してください
        </p>
      </div>
    </div>
  );
}

interface GLBViewerProps {
  modelPath: string;
}

export function GLBViewer({ modelPath }: GLBViewerProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-slate-900">
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <Suspense fallback={<Loader />}>
            <Model url={modelPath} />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls makeDefault />
          <Grid
            infiniteGrid
            cellSize={1}
            sectionSize={5}
            cellColor="#334155"
            sectionColor="#475569"
            fadeDistance={50}
          />
          <axesHelper args={[3]} />
        </Canvas>
        <div className="pointer-events-none absolute bottom-3 left-3 text-xs text-slate-400">
          ドラッグ: 回転 / スクロール: ズーム / 右ドラッグ: 移動
        </div>
      </ErrorBoundary>
    </div>
  );
}
