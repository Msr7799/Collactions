//app-icon.tsx component
import Image from "next/image";

const AppIcon = () => {
    return (
        <Image
            src="/app-icon-black.svg"
            alt="Collactions Logo"
            width={150}
            height={150}

className="border-8 bg-primary/20 filter drop-brightness-600 drop-shadow-[2px_1px_5px_rgba(255,255,255,0.09)] contrast-100 saturate-270 brightness-[.8] !border-sec-primary/70 rounded-4xl shadow-lg p-2"
        />
    );
};

export default AppIcon;
