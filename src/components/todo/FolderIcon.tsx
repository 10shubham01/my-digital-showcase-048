import { motion } from "framer-motion";

interface FolderIconProps {
  color: string;
  size?: number;
}

const FolderIcon = ({ color, size = 20 }: FolderIconProps) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    whileHover={{ scale: 1.1 }}
  >
    <path
      d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z"
      fill={color}
      opacity={0.85}
    />
    <path
      d="M2 8H22V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V8Z"
      fill={color}
    />
  </motion.svg>
);

export default FolderIcon;
