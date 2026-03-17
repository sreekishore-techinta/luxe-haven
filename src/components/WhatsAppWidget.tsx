import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppWidget = () => {
    const phoneNumber = "919000000000"; // Replace with actual number
    const message = "Hello! I'm interested in your collection.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-[100] bg-[#25D366] text-white p-3.5 lg:p-4 rounded-full shadow-2xl flex items-center justify-center group"
            aria-label="Chat on WhatsApp"
        >
            <div className="absolute right-full mr-4 bg-white text-[#075E54] px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block pointer-events-none whitespace-nowrap font-body text-xs font-bold uppercase tracking-widest border border-gray-100">
                Chat with us
            </div>
            <FaWhatsapp size={24} className="lg:w-7 lg:h-7" />
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
        </motion.a>
    );
};

export default WhatsAppWidget;
