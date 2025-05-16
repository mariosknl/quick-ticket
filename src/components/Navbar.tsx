import Link from "next/link";
// import { getCurrentUser } from '@/lib/current-user';
// import LogoutButton from './LogoutButton';

const Navbar = async () => {
  // const user = await getCurrentUser();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div>
        <Link href="/" className="text-xl font-bold text-blue-600">
          QuickTicket
        </Link>
      </div>
      <div className="flex items-center space-x-4"></div>
    </nav>
  );
};

export default Navbar;
