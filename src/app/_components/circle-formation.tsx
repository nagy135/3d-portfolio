import { type ThreeEvent, useLoader, useThree } from "@react-three/fiber";
import { type FC, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Model from "./model";
import CameraController from "./camera-controller";

import { CameraControls, RoundedBox, Text } from '@react-three/drei'

interface ICircleFormation {
	content: {
		lift?: number;
		image: string;
		model: any;
		rotation?: [number, number, number];
		scale?: [number, number, number];
	}[];
}
export const clamp = (input: number, min: number, max: number): number => {
	return input < min ? min : input > max ? max : input;
}

export const mapRange = (current: number, in_min: number, in_max: number, out_min: number, out_max: number): number => {
	const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	return clamp(mapped, out_min, out_max);
}

const VIEWPORT_SCALING = { min: 0.2, max: 2.0 };
const DRAG_IGNORE_MARGIN = 10;
const SPREAD = 2.5;
const SPREAD_FLASHLIGHT = SPREAD + 2;
const IMAGE_WIDTH = 3;

const CircleFormation: FC<ICircleFormation> = ({ content }) => {
	const refMap = useRef<Record<number, THREE.Mesh | null>>({});
	const cameraControllerRef = useRef<OrbitControls | null>(null);
	const rotationRef = useRef(0);
	const dragOffsetRef = useRef<number | null>(null);
	const useEventRef = useRef(false);
	const flashlightRef = useRef<THREE.PointLight>(null);

	const { viewport, camera } = useThree();
	const [clicked, setClicked] = useState<boolean[]>(
		new Array(content.length).fill(true)
	);

	const [positions, setPositions] = useState<
		{ x: number; y: number; z: number }[]
	>([]);

	const tex = useLoader(
		THREE.TextureLoader,
		content.map((e) => e.image)
	);
	useFrame(() => {
		cameraControllerRef.current?.update();
		for (const mesh of Object.values(refMap.current)) {
			if (!mesh) continue;
			mesh.rotation.y = rotationRef.current;
		}

		if (flashlightRef.current) {
			const multiplier = SPREAD_FLASHLIGHT;
			const radians = 2 * Math.PI + 0.5 + rotationRef.current;
			const x = Math.sin(radians);
			const z = Math.cos(radians);
			flashlightRef.current.rotation.x = x * multiplier;
			flashlightRef.current.rotation.y = 1;
			flashlightRef.current.rotation.z = z * multiplier;
		}
	});

	const imageClicked = (i: number) => {
		if (!cameraControllerRef.current) return;
		// @ts-ignore
		if (content[i].model === null) return;
		setClicked((prev) => {
			const next = [...prev];
			next[i] = !next[i];
			return next;
		});
	};

	useEffect(() => {
		if (!viewport) return;
		camera.zoom = 1;
		camera.updateProjectionMatrix();

		for (let i = 0; i < content.length; i++) {
			const multiplier = SPREAD;
			const radians = ((2 * Math.PI) / content.length) * i;
			const x = Math.sin(radians);
			const z = Math.cos(radians);
			setPositions((prev) => [
				...prev,
				{ x: x * multiplier, y: 0, z: z * multiplier - 1 },
			]);
		}
	}, [content, viewport, camera]);

	const handlePointer = (
		e: ThreeEvent<PointerEvent> | null,
		event: "up" | "down" | "drag",
		i?: number
	) => {
		if (e) e.stopPropagation();
		if (event === "down") {
			useEventRef.current = true;
		} else if (event === "drag" && e) {
			// @ts-ignore
			const changeX = e.offsetX;
			if (
				dragOffsetRef.current === null ||
				Math.abs(dragOffsetRef.current - changeX) > DRAG_IGNORE_MARGIN
			) {
				useEventRef.current = false;
				dragOffsetRef.current = changeX;
			}
		} else if (event === "up") {
			if (useEventRef.current) if (i !== undefined) imageClicked(i);
			useEventRef.current = false;
		}
	};

	return (
		<>
			<CameraController
				instanceRef={cameraControllerRef}
				onRotate={(x: number) => {
					rotationRef.current = x;
				}}
			/>
			{positions.map((e, i) => {
				const texture = tex[i];
				if (!texture?.image) return null;
				const ratio = texture.image.width / texture.image.height;

				return (
					<>
						<mesh
							position={[0, 0, -0.085]}
						>
							<Text
								fontWeight={550}
								outlineColor="#19a85b" outlineWidth={0.01} color="#0b0b0b" anchorX="center" anchorY="top">
								viktor3D
							</Text>
						</mesh>
						<mesh
							position={[0, -0.7, -0.24]}
						>
							<RoundedBox
								args={[5, 1.5, 0.5]} // Width, height, depth. Default is [1, 1, 1]
								radius={0.05} // Radius of the rounded corners. Default is 0.05
								smoothness={4} // The number of curve segments. Default is 4
								bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
								creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
							>
								<meshPhongMaterial color="#f3f3f3" wireframe />
							</RoundedBox>
							<RoundedBox
								radius={0.05}
								args={[4.5, 1, 0.3]}>
								<meshStandardMaterial color={"#0b0b0b"} attach="material" />
							</RoundedBox>
						</mesh>
						<mesh
							position={[0, 0, -0.3]}
						>
							<Text
								rotation={[0, Math.PI, 0]}
								position={[0, 0, -0.1]}
								fontWeight={550}
								outlineColor="#19a85b" outlineWidth={0.01} color="#0b0b0b" anchorX="center" anchorY="top">
								welcome
							</Text>
						</mesh>
						{content[i] && content[i]?.model !== null ? (
							<Model
								key={`model-${i}`}
								visible={clicked[i] ?? false}
								model={content[i]?.model}
								rotation={content[i]?.rotation ?? [0, 0, 0]}
								scale={content[i]?.scale ?? [1, 1, 1]}
								position={[e.x, e.y + (content[i]?.lift ?? 0), e.z]}
							/>
						) : null}
						<mesh
							visible={content[i] === null || !clicked[i]}
							onPointerDown={(e) => handlePointer(e, "down")}
							onPointerUp={(e) => handlePointer(e, "up", i)}
							onPointerMove={(e) => handlePointer(e, "drag")}
							ref={(r) => {
								refMap.current[i] = r;
							}}
							position={[e.x, e.y, e.z]}
							rotation={[0, rotationRef.current, 0]}
							key={`image-${i}`}
						>
							<planeGeometry
								key={`image-plane-${i}`}
								attach="geometry"
								args={[IMAGE_WIDTH, IMAGE_WIDTH / ratio]}
							/>
							<meshBasicMaterial
								key={`image-mesh-${i}`}
								attach="material"
								map={texture}
							/>
						</mesh>
					</>
				);
			})}
		</>
	);
};

export default CircleFormation;
