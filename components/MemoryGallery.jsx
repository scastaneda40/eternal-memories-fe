import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Plane } from "@react-three/drei";
import { TextureLoader } from "three";

// Mock data for memory images
const mockData = [
    {
        id: "1",
        title: "Memory 1",
        url: "https://placekitten.com/400/300",
    },
    {
        id: "2",
        title: "Memory 2",
        url: "https://placekitten.com/500/400",
    },
    {
        id: "3",
        title: "Memory 3",
        url: "https://placekitten.com/600/500",
    },
    {
        id: "4",
        title: "Memory 4",
        url: "https://placekitten.com/700/600",
    },
];

const MemoryGallery = () => {
    return (
        <Canvas style={{ height: "100vh" }}>
            {/* Lights and controls */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls />
            
            {/* Memory Wall */}
            <MemoryWall data={mockData} />
        </Canvas>
    );
};

const MemoryWall = ({ data }) => {
    return (
        <group>
            {/* Floor */}
            <Plane
                args={[10, 10]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.5, 0]}
            >
                <meshStandardMaterial color="#a0a0a0" />
            </Plane>

            {/* Back wall */}
            <Plane args={[10, 5]} position={[0, 2.5, -5]} rotation={[0, 0, 0]}>
                <meshStandardMaterial color="#ffffff" />
            </Plane>

            {/* Frames */}
            {data.map((memory, index) => (
                <MemoryFrame
                    key={memory.id}
                    textureUrl={memory.url}
                    position={[index * 2 - 4, 2.5, -4.9]} // Adjust positions along the wall
                />
            ))}
        </group>
    );
};

const MemoryFrame = ({ textureUrl, position }) => {
    const [texture, setTexture] = useState(null);

    useEffect(() => {
        const loader = new TextureLoader();
        loader.load(
            textureUrl,
            (loadedTexture) => {
                setTexture(loadedTexture);
            },
            undefined,
            (error) => {
                console.error("Error loading texture:", error);
            }
        );
    }, [textureUrl]);

    if (!texture) return null;

    return (
        <mesh position={position}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    );
};

export default MemoryGallery;












