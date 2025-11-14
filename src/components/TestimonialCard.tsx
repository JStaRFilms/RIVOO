'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  delay?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, name, role, avatar, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
    >
      <p className="text-gray-700 mb-4 italic">"{quote}"</p>
      <div className="flex items-center">
        <Image
          src={avatar}
          alt={name}
          width={50}
          height={50}
          className="rounded-full mr-4"
        />
        <div>
          <h4 className="font-semibold text-user-text">{name}</h4>
          <p className="text-sm text-user-secondary">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;