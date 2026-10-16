export const formatRoleName = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "manager":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "supervisor":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "subcontractor":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getAvatarColor = (name: string): string => {
  // Generate consistent color based on name
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
  ];

  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

export const getInitialLetters = (fullName: string): string => {
  return fullName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2); // Limit to 2 characters for better display
};
