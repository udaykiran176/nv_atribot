export const Footer = () => {
  return (
    <footer className="flex items-center justify-center p-4">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} NV Atribot. All rights reserved.
      </p>
    </footer>
  );
};