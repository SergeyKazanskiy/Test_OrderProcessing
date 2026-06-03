import Image from "next/image";
import OrderTester from '@/modules/order-manager';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full bg-white rounded-lg shadow-md dark:bg-gray-800">
        <OrderTester />
      </div>
    </div>
  );
}
