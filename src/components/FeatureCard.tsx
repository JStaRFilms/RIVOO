'use client';
import { motion } from 'framer-motion';
import { Ambulance, Bell, Lock, Handshake, Car } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-user-primary rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;