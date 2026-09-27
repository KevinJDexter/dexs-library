import { Animation, ArcRotateCamera, Color3, Color4, CubicEase, DirectionalLight, DynamicTexture, EasingFunction, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { Ref, useEffect, useImperativeHandle, useRef } from "react";

export interface DiceHandle {
  roll: () => Promise<number>;
}

interface DiceRollerProps {
  ref?: Ref<DiceHandle>;
}

const TWO_PI = Math.PI * 2;

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
}

const FACES = [
  { value: 1, position: new Vector3(0, 0, -0.5), rotation: new Vector3(0, 0, 0) },
  { value: 6, position: new Vector3(0, 0, 0.5), rotation: new Vector3(0, Math.PI, 0) },
  { value: 3, position: new Vector3(0.5, 0, 0), rotation: new Vector3(0, -Math.PI / 2, 0) },
  { value: 4, position: new Vector3(-0.5, 0, 0), rotation: new Vector3(0, Math.PI / 2, 0) },
  { value: 2, position: new Vector3(0, 0.5, 0), rotation: new Vector3(Math.PI / 2, 0, 0) },
  { value: 5, position: new Vector3(0, -0.5, 0), rotation: new Vector3(-Math.PI / 2, 0, 0) },
];

const TOP_ROTATION: Record<number, Vector3> = {
  2: new Vector3(0, 0, 0),
  5: new Vector3(Math.PI, 0, 0),
  1: new Vector3(Math.PI / 2, 0, 0),
  6: new Vector3(-Math.PI / 2, 0, 0),
  3: new Vector3(0, 0, Math.PI / 2),
  4: new Vector3(0, 0, -Math.PI / 2),
};

function makeFaceMaterial (scene: Scene, value: number): StandardMaterial {
  const size = 256;
  const texture = new DynamicTexture(`face=${value}`, size, scene, true);
  const ctx = texture.getContext();
  ctx.fillStyle = 'lightgrey';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'grey';
  ctx.lineWidth = 12;
  ctx.strokeRect(0, 0, size, size);
  ctx.fillStyle = value === 1 ? 'red' : 'black';
  const radius = value === 1 ? 34 : 24;
  for (const pip of PIPS[value]) {
    const x = size * (0.25 + 0.25 * (pip % 3));
    const y = size * (0.25 + 0.25 * (Math.floor(pip / 3)));
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TWO_PI);
    ctx.fill();
  }
  texture.update();

  const material = new StandardMaterial(`face-mat-${value}`, scene);
  material.diffuseTexture = texture;
  material.specularColor = new Color3(0.15, 0.15, 0.15);
  return material;
};

const normalize = (angle: number) => (
  ((angle % TWO_PI) + TWO_PI) % TWO_PI
);

export default function DiceRoller({ ref }: DiceRollerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const dieRef = useRef<TransformNode | null>(null);
  const rollingRef = useRef<Promise<number> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const engine = new Engine(canvas, true, { adaptToDeviceRatio: true });
    const scene = new Scene(engine)
    scene.clearColor = new Color4(0, 0, 0, 0);

    const camera = new ArcRotateCamera('camera', -1, Math.PI / 4.2, 4.2, Vector3.Zero(), scene);
    camera.lowerRadiusLimit = camera.upperRadiusLimit = camera.radius;

    new HemisphericLight('sky', new Vector3(0, 1, 0), scene).intensity = 0.8;
    const sun = new DirectionalLight('sun', new Vector3(-0.5, -1, 0.6), scene);
    sun.intensity = 0.6;

    const die = new TransformNode('die', scene);
    for (const face of FACES) {
      const plane = MeshBuilder.CreatePlane(`face-${face.value}`, { size: 1 }, scene);
      plane.position = face.position.clone();
      plane.rotation = face.rotation.clone();
      plane.material = makeFaceMaterial(scene, face.value);
      plane.parent = die;
    }
    die.rotation = new Vector3(0.5, 0.6, 0.2);

    engineRef.current = engine;
    sceneRef.current = scene;
    dieRef.current = die;

    const resizeObserver = new ResizeObserver(() => engine.resize());
    resizeObserver.observe(canvas);

    const render = () => scene.render();
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        engine.runRenderLoop(render);
      } else {
        engine.stopRenderLoop(render);
      }
    })
    visibilityObserver.observe(canvas);   

    return (() => {
      resizeObserver.unobserve(canvas);
      visibilityObserver.unobserve(canvas);
      engine.stopRenderLoop(render);
      scene.dispose();
      engine.dispose();
      engineRef.current = sceneRef.current = dieRef.current = null;
    })
  }, [])

  useImperativeHandle(ref, () => ({
    roll: () => {
      if (rollingRef.current) return rollingRef.current;
      const rolling = new Promise<number>((resolve, reject) => {
        const scene = sceneRef.current;
        const die = dieRef.current;
        if (!scene || !die) return reject(new Error("Die is not ready"));

        const value = 1 + Math.floor(Math.random() * 6);
        const target = TOP_ROTATION[value];
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const fps = 60;
        const frames = reduceMotion ? 12 : 72;
        const spins = reduceMotion ? 0 : 2;

        die.rotation = new Vector3(normalize(die.rotation.x), normalize(die.rotation.y), normalize(die.rotation.z));
        const end = new Vector3(
          target.x + TWO_PI * (spins + 1),
          Math.random() * TWO_PI,
          target.z + TWO_PI * spins
        )

        const ease = new CubicEase();
        ease.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

        const tumble = new Animation('tumble', 'rotation', fps, Animation.ANIMATIONTYPE_VECTOR3);
        tumble.setKeys([
          { frame: 0, value: die.rotation.clone() },
          { frame: frames, value: end},
        ])
        tumble.setEasingFunction(ease);

        const hop = new Animation('hop', 'position.y', fps, Animation.ANIMATIONTYPE_FLOAT);
        hop.setKeys([
          { frame: 0, value: 0 },
          { frame: frames * 0.3, value: reduceMotion ? 0 : 1.2},
          { frame: frames * 0.7, value: 0 },
          { frame: frames * 0.82, value: reduceMotion ? 0 : 0.18},
          { frame: frames, value: 0 },
        ])

        scene.beginDirectAnimation(die, [tumble, hop], 0, frames, false, 1, () => {
          rollingRef.current = null;
          resolve(value);
        })
      });
      rollingRef.current = rolling;
      return rolling;
    }
  }));

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', outline: 'none' }} />;

} 