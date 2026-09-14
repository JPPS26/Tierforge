// Camada de compatibilidade com ../services/db
export {
  createTierList as saveTierList,
  getUserTierLists,
  getTierLists as getRecentTierLists,
  getTierListById,
  voteTierList,
  incrementViews,
} from "../services/db";
