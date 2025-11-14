'use client';

import { motion } from 'framer-motion';

interface WhyChooseCardProps {
  number: string;
  title: string;
  description: string;
  imageSrc: string;
  delay?: number;
}

const WhyChooseCard: React.FC<WhyChooseCardProps> = ({ number, title, description, imageSrc, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="flex flex-col md:flex-row gap-6 bg-white rounded-xl p-6 shadow-md"
    >
      <div className="md:w-1/2">
        <img src={imageSrc} alt={title} className="w-full h-auto rounded-lg" />
      </div>
      <div className="md:w-1/2 flex flex-col justify-center">
        <span className="text-4xl font-bold text-user-primary mb-2">{number}</span>
        <h3 className="font-bold text-xl mb-2 text-user-text">{title}</h3>
        <p className="text-gray-700">{description}</p>
      </div>
    </motion.div>
  );
};

export default WhyChooseCard;