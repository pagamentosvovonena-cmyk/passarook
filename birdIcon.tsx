import React from 'react';
import { Bird, LucideProps } from 'lucide-react';

export const BirdIcon = (props: LucideProps) => {
  return <Bird strokeWidth={1.5} {...props} />;
};

export default BirdIcon;