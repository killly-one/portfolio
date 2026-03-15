import { useRef, Suspense } from 'react'
import { motion, useInView } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import './Portfolio3D.css'

function Model({ url }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function Scene({ modelUrl }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        {modelUrl ? (
          <Model url={modelUrl} />
        ) : (
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        )}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}

function Portfolio3D() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  // 示例作品数据 - 替换为你的实际作品
  const projects = [
    {
      id: 1,
      title: '3D作品 1',
      description: '这是一个3D建模作品的描述',
      modelUrl: '/models/project1.glb', // 替换为你的模型路径
      category: '建模'
    },
    {
      id: 2,
      title: '3D作品 2',
      description: '另一个3D作品的描述',
      modelUrl: '/models/project2.glb',
      category: '交互'
    },
    {
      id: 3,
      title: '3D作品 3',
      description: '第三个3D作品的描述',
      modelUrl: null, // 如果没有模型，会显示占位立方体
      category: 'AR/VR'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  return (
    <div className="portfolio-3d" ref={ref}>
      <motion.div
        className="portfolio-grid"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {projects.map((project) => (
          <motion.div
            key={project.id}
            className="portfolio-item-3d"
            variants={itemVariants}
          >
            <div className="portfolio-item-3d-viewer">
              <Scene modelUrl={project.modelUrl} />
            </div>
            <div className="portfolio-item-3d-info">
              <div className="portfolio-item-3d-category">{project.category}</div>
              <h3 className="portfolio-item-3d-title">{project.title}</h3>
              <p className="portfolio-item-3d-description">{project.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default Portfolio3D
