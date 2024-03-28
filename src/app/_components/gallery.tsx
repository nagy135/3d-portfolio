"use client";

import { Canvas, useFrame, type Vector3 } from '@react-three/fiber'
import CircleFormation from './circle-formation';
import { extend } from '@react-three/fiber'
import { OrbitControls, TransformControls } from 'three-stdlib'
import { Suspense, useRef, useState } from 'react';
import { Environment, RoundedBox, Sky, SpotLight, Stars } from '@react-three/drei';
import { Text } from '@react-three/drei'

extend({ OrbitControls, TransformControls })

const UPDATE_INTERVAL = 2 / 60;

const SkyComponent = () => {
	const [sunPosition, setSunPosition] = useState([0, 2, 0]);
	const timeOffset = useRef<number>(1);
	const updatedAt = useRef<number>(0);
	useFrame(({ clock }) => {
		const elapsedTime = clock.getElapsedTime();
		if (updatedAt.current + UPDATE_INTERVAL > elapsedTime) return;
		updatedAt.current = elapsedTime;

		const radians = ((2 * Math.PI) / 360) * timeOffset.current;

		const x = Math.sin(radians);
		const y = Math.cos(radians);

		timeOffset.current += 1;

		setSunPosition(prev => [x, y, prev[2]!]);
	});
	return <Sky
		distance={450000}
		sunPosition={sunPosition as Vector3}
		inclination={0}
		azimuth={0.25}
	/>
};

export function Gallery() {
	return (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			height: '100vh',
		}}>
			<Canvas
				shadows={true}>
				<Suspense
					fallback={
						<Text
							fontWeight={550}
							outlineColor="#19a85b" outlineWidth={0.01} color="#0b0b0b" anchorX="center" anchorY="top">
							loading canvas...
						</Text>
					}
				>
					<mesh
						position={[3, 2, 0]}
					>
						<SpotLight
							distance={5}
							angle={0.15}
							attenuation={5}
							anglePower={2} // Diffuse-cone anglePower (default: 5)
						/>
					</mesh>

					<mesh
						position={[-3, 2, 0]}
					>
						<SpotLight
							distance={5}
							angle={0.15}
							attenuation={5}
							anglePower={2} // Diffuse-cone anglePower (default: 5)
						/>
					</mesh>

					<Environment preset="city" />
					<SkyComponent />

					<Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
					<directionalLight castShadow intensity={1.0} position={[0, 0, 2]} />
					<directionalLight castShadow intensity={1.0} position={[0, 0, -3]} />
					<directionalLight castShadow intensity={0.5} position={[3, 1, -3]} />

					<mesh receiveShadow position={[0, -2, 0]}>
						<RoundedBox
							smoothness={4}
							bevelSegments={4}
							creaseAngle={0.4}
							radius={0.4}
							args={[10, 1, 10]}>
							<meshStandardMaterial color={"#0b0b0b"} attach="material" />
						</RoundedBox>
					</mesh>

					<Suspense
						fallback={
							<Text
								fontWeight={550}
								outlineColor="#19a85b" outlineWidth={0.01} color="#0b0b0b" anchorX="center" anchorY="top">
								loading models...
							</Text>
						}
					>
						<CircleFormation
							content={[
								{
									// @ts-ignore
									image: "images/nautilus_gears.jpg",
									model: "nautilus_gears.gltf",
									lift: -0.7,
									rotation: [0, 0, (2.5 * Math.PI) / 36],
								},
								{
									// @ts-ignore
									image: "images/double_screw.jpg",
									model: "double_screw.gltf",
									scale: [0.03, 0.03, 0.03],
									lift: -1,
								},
								{
									image: "images/fidget.jpg",
									model: "fidget.gltf",
									scale: [0.3, 0.3, 0.3],
									lift: -1,
								},
							]}
						/>
					</Suspense>
				</Suspense>
			</ Canvas>
		</div>
	)
}
