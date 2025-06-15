// Utility to convert Minecraft color codes (e.g., '§4') to hex colors
export function getHexFromMinecraft(colorCode: string): string {
  if (!colorCode || colorCode.length < 2 || colorCode[0] !== "§") return "#000000";
  const stripped = colorCode[1].toLowerCase();
  switch (stripped) {
    case "0": return "#000000";
    case "1": return "#0000AA";
    case "2": return "#00AA00";
    case "3": return "#00AAAA";
    case "4": return "#AA0000";
    case "5": return "#AA00AA";
    case "6": return "#FFAA00";
    case "7": return "#AAAAAA";
    case "8": return "#555555";
    case "9": return "#5555FF";
    case "a": return "#55FF55";
    case "b": return "#55FFFF";
    case "c": return "#FF5555";
    case "d": return "#FF55FF";
    case "e": return "#FFFF55";
    case "f": return "#FFFFFF";
    default: return "#000000";
  }
} 