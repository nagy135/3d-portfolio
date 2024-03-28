"use client";

import { Canvas, type Vector3 } from '@react-three/fiber'
import CircleFormation from './circle-formation';
import { extend } from '@react-three/fiber'
import { OrbitControls, TransformControls } from 'three-stdlib'
import { Suspense } from 'react';
import { Cloud, Environment, Sky, Stars } from '@react-three/drei';
import { Text } from '@react-three/drei'

extend({ OrbitControls, TransformControls })

const sunPosition: Vector3 = [0, 5, 12];


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
					<Sky
						distance={450000}
						sunPosition={sunPosition}
						inclination={0}
						azimuth={0.25}
					/>
					<Environment preset="city" />

					<Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

					<Cloud
						opacity={0.5}
						speed={0.1} // Rotation speed
						segments={20} // Number of particles
						position={[5, 6, 3]}
					/>
					<directionalLight intensity={1.0} position={[0, 0, 2]} />
					<directionalLight intensity={1.0} position={[0, 0, -3]} />
					<directionalLight intensity={0.5} position={[3, 1, -3]} />

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
