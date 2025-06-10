import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiUpload,
  FiChevronUp,
  FiAlertTriangle,
  FiTool,
  FiCheckCircle,
  FiUsers,
  FiBarChart2,
  FiDatabase,
  FiClipboard,
  FiFilter,
  FiPackage,
  FiChevronLeft,
  FiHome,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiLogOut,
  FiSun,
  FiMoon,
  FiSettings,
  FiBell,
  FiEdit,
  FiEye,
  FiClock,
  FiUser,
  FiCalendar,
  FiFlag,
  FiStar,
  FiPrinter,
  FiShoppingCart,
  FiBox,
  FiLayers,
  FiTag,
  FiDollarSign,
  FiTruck,
  FiArchive,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import logoMaintify2 from "../assets/logo_maintify2.svg";
import logomaintify from "../assets/logo_maintify_title.svg";

type InventoryStatus = "in-stock" | "low-stock" | "out-of-stock" | "on-order";
type InventoryCategory = "spare-parts" | "consumables" | "tools" | "safety" | "office";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: InventoryCategory;
  status: InventoryStatus;
  quantity: number;
  minQuantity: number;
  unit: string;
  location: string;
  supplier: string;
  cost: number;
  lastOrdered: string;
  nextOrder: string;
  barcode: string;
  notes: string[];
  image?: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, to, expanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <motion.button
      onClick={() => navigate(to)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left flex items-center p-2 rounded-lg transition-all duration-200
        ${active ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-700"}
      `}
    >
      <span className="text-xl">{icon}</span>
      {expanded && (
        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="ml-3 text-base">
          {text}
        </motion.span>
      )}
    </motion.button>
  );
};

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith("+");

  return (
    <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-xl shadow-sm p-5 border border-blue-100 cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-extrabold mt-1 text-gray-900">{value}</p>
        </div>
        <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="p-3 rounded-full bg-blue-50 text-blue-600 text-2xl">
          {icon}
        </motion.div>
      </div>
      <motion.p animate={{ x: isPositive ? [0, 2, 0] : [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }} className={`mt-3 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {change} from last month
      </motion.p>
    </motion.div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4 border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <FiX />
          </motion.button>
        </div>
        <div>{children}</div>
      </motion.div>
    </motion.div>
  );
};

interface AddInventoryFormProps {
  onAddInventory: (inventory: Omit<InventoryItem, "id" | "notes">) => void;
}

const AddInventoryForm: React.FC<AddInventoryFormProps> = ({ onAddInventory }) => {
  const [formData, setFormData] = useState<Omit<InventoryItem, "id" | "notes">>({
    name: "",
    description: "",
    category: "spare-parts",
    status: "in-stock",
    quantity: 0,
    minQuantity: 5,
    unit: "pcs",
    location: "",
    supplier: "",
    cost: 0,
    lastOrdered: "",
    nextOrder: "",
    barcode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInventory(formData);
    setFormData({
      name: "",
      description: "",
      category: "spare-parts",
      status: "in-stock",
      quantity: 0,
      minQuantity: 5,
      unit: "pcs",
      location: "",
      supplier: "",
      cost: 0,
      lastOrdered: "",
      nextOrder: "",
      barcode: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Item Name*
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category*
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="spare-parts">Spare Parts</option>
            <option value="consumables">Consumables</option>
            <option value="tools">Tools</option>
            <option value="safety">Safety Equipment</option>
            <option value="office">Office Supplies</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status*
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="on-order">On Order</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Current Quantity*
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleNumberChange}
            min="0"
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-700">
            Minimum Quantity*
          </label>
          <input
            type="number"
            id="minQuantity"
            name="minQuantity"
            value={formData.minQuantity}
            onChange={handleNumberChange}
            min="0"
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
            Unit*
          </label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="pcs">Pieces</option>
            <option value="kg">Kilograms</option>
            <option value="l">Liters</option>
            <option value="m">Meters</option>
            <option value="box">Boxes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location*
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
            Supplier*
          </label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
            Unit Cost ($)*
          </label>
          <input
            type="number"
            id="cost"
            name="cost"
            value={formData.cost}
            onChange={handleNumberChange}
            min="0"
            step="0.01"
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
            Barcode/Serial
          </label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lastOrdered" className="block text-sm font-medium text-gray-700">
            Last Ordered
          </label>
          <input
            type="date"
            id="lastOrdered"
            name="lastOrdered"
            value={formData.lastOrdered}
            onChange={handleChange}
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="nextOrder" className="block text-sm font-medium text-gray-700">
            Next Order
          </label>
          <input
            type="date"
            id="nextOrder"
            name="nextOrder"
            value={formData.nextOrder}
            onChange={handleChange}
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Add Inventory Item
        </motion.button>
      </div>
    </form>
  );
};

interface InventoryDetailsFormProps {
  inventory: InventoryItem;
  isEditing: boolean;
  onSave: (inventory: InventoryItem) => void;
  onCancel: () => void;
  onRequestOrder: (inventory: InventoryItem) => void;
}

const InventoryDetailsForm: React.FC<InventoryDetailsFormProps> = ({ inventory, isEditing, onSave, onCancel, onRequestOrder }) => {
  const [formData, setFormData] = useState<InventoryItem>(inventory);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    setFormData(inventory);
  }, [inventory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setFormData((prev) => ({
        ...prev,
        notes: [...prev.notes, newNote],
      }));
      setNewNote("");
    }
  };

  const handleRemoveNote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="detail-id" className="block text-sm font-medium text-gray-700">
          Inventory ID
        </label>
        <input type="text" id="detail-id" value={formData.id} readOnly className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200" />
      </div>

      <div>
        <label htmlFor="detail-name" className="block text-sm font-medium text-gray-700">
          Item Name
        </label>
        <input
          type="text"
          id="detail-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>

      <div>
        <label htmlFor="detail-description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="detail-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          readOnly={!isEditing}
          rows={3}
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="detail-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="spare-parts">Spare Parts</option>
            <option value="consumables">Consumables</option>
            <option value="tools">Tools</option>
            <option value="safety">Safety Equipment</option>
            <option value="office">Office Supplies</option>
          </select>
        </div>

        <div>
          <label htmlFor="detail-status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="detail-status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="on-order">On Order</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="detail-quantity" className="block text-sm font-medium text-gray-700">
            Current Quantity
          </label>
          <input
            type="number"
            id="detail-quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleNumberChange}
            readOnly={!isEditing}
            min="0"
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>

        <div>
          <label htmlFor="detail-minQuantity" className="block text-sm font-medium text-gray-700">
            Minimum Quantity
          </label>
          <input
            type="number"
            id="detail-minQuantity"
            name="minQuantity"
            value={formData.minQuantity}
            onChange={handleNumberChange}
            readOnly={!isEditing}
            min="0"
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>

        <div>
          <label htmlFor="detail-unit" className="block text-sm font-medium text-gray-700">
            Unit
          </label>
          <select
            id="detail-unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="pcs">Pieces</option>
            <option value="kg">Kilograms</option>
            <option value="l">Liters</option>
            <option value="m">Meters</option>
            <option value="box">Boxes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="detail-location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            readOnly={!isEditing}
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>

        <div>
          <label htmlFor="detail-supplier" className="block text-sm font-medium text-gray-700">
            Supplier
          </label>
          <input
            type="text"
            id="detail-supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            readOnly={!isEditing}
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-cost" className="block text-sm font-medium text-gray-700">
            Unit Cost ($)
          </label>
          <input
            type="number"
            id="detail-cost"
            name="cost"
            value={formData.cost}
            onChange={handleNumberChange}
            readOnly={!isEditing}
            min="0"
            step="0.01"
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>

        <div>
          <label htmlFor="detail-barcode" className="block text-sm font-medium text-gray-700">
            Barcode/Serial
          </label>
          <input
            type="text"
            id="detail-barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-lastOrdered" className="block text-sm font-medium text-gray-700">
            Last Ordered
          </label>
          <input
            type="date"
            id="detail-lastOrdered"
            name="lastOrdered"
            value={formData.lastOrdered}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>

        <div>
          <label htmlFor="detail-nextOrder" className="block text-sm font-medium text-gray-700">
            Next Order
          </label>
          <input
            type="date"
            id="detail-nextOrder"
            name="nextOrder"
            value={formData.nextOrder}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <div className="space-y-3">
          {formData.notes.map((note, index) => (
            <div key={index} className="bg-blue-50 p-3 rounded-lg relative">
              <p className="text-gray-700">{note}</p>
              {isEditing && (
                <button type="button" onClick={() => handleRemoveNote(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex">
          <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add new note" rows={2} className="flex-1 border border-blue-200 rounded-l-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          <button type="button" onClick={handleAddNote} className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700">
            Add
          </button>
        </div>
      </div>

      <div className="flex justify-between space-x-3 mt-6">
        <div>
          {formData.status === "low-stock" || formData.status === "out-of-stock" ? (
            <motion.button
              type="button"
              onClick={() => onRequestOrder(formData)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <FiShoppingCart className="mr-2" />
              Request Order
            </motion.button>
          ) : null}
        </div>

        <div className="flex space-x-3">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {isEditing ? "Cancel" : "Close"}
          </motion.button>

          {isEditing && (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Save Changes
            </motion.button>
          )}
        </div>
      </div>
    </form>
  );
};

const InventoryDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [showInventoryDetailsModal, setShowInventoryDetailsModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [inventoryPerPage] = useState(5);
  const { user, fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "INV-001",
      name: "HVAC Filter",
      description: "High-efficiency particulate air filter for HVAC systems",
      category: "spare-parts",
      status: "in-stock",
      quantity: 25,
      minQuantity: 10,
      unit: "pcs",
      location: "Warehouse A, Shelf 3B",
      supplier: "ACME Filters Inc.",
      cost: 45.99,
      lastOrdered: "2023-09-15",
      nextOrder: "2023-12-15",
      barcode: "HF-789456123",
      notes: ["Compatible with all Trane XR15 models", "Next shipment expected December 10"],
    },
    {
      id: "INV-002",
      name: "Hydraulic Oil",
      description: "Premium grade hydraulic oil for industrial machinery",
      category: "consumables",
      status: "low-stock",
      quantity: 8,
      minQuantity: 15,
      unit: "l",
      location: "Maintenance Room, Cabinet 2",
      supplier: "LubriMax",
      cost: 32.5,
      lastOrdered: "2023-10-01",
      nextOrder: "",
      barcode: "HO-456789123",
      notes: ["For use with forklifts and hydraulic presses", "Order more before November"],
    },
    {
      id: "INV-003",
      name: "Safety Glasses",
      description: "Anti-fog safety glasses with UV protection",
      category: "safety",
      status: "in-stock",
      quantity: 50,
      minQuantity: 20,
      unit: "pcs",
      location: "Safety Locker, Bin 5",
      supplier: "SafeVision",
      cost: 12.99,
      lastOrdered: "2023-08-20",
      nextOrder: "2024-02-20",
      barcode: "SG-123456789",
      notes: ["Popular item - check stock monthly", "ANSI Z87.1 certified"],
    },
    {
      id: "INV-004",
      name: "Industrial Bearing",
      description: "Sealed ball bearing for conveyor systems",
      category: "spare-parts",
      status: "out-of-stock",
      quantity: 0,
      minQuantity: 5,
      unit: "pcs",
      location: "Parts Room, Bin 12",
      supplier: "BearingTech",
      cost: 89.75,
      lastOrdered: "2023-09-30",
      nextOrder: "2023-11-05",
      barcode: "IB-987654321",
      notes: ["Model #BT-6205-2RS", "Backordered - expected Nov 5"],
    },
    {
      id: "INV-005",
      name: "Multimeter",
      description: "Digital multimeter for electrical diagnostics",
      category: "tools",
      status: "in-stock",
      quantity: 6,
      minQuantity: 3,
      unit: "pcs",
      location: "Tool Crib, Drawer 4",
      supplier: "ElectroTools",
      cost: 149.99,
      lastOrdered: "2023-07-10",
      nextOrder: "",
      barcode: "MM-654321987",
      notes: ["Check calibration every 6 months", "Last calibration: 2023-07-15"],
    },
    {
      id: "INV-006",
      name: "Printer Toner",
      description: "Black toner cartridge for OfficeJet Pro 9015",
      category: "office",
      status: "low-stock",
      quantity: 2,
      minQuantity: 5,
      unit: "pcs",
      location: "Supply Closet, Shelf 1",
      supplier: "PrintRight",
      cost: 79.99,
      lastOrdered: "2023-10-05",
      nextOrder: "",
      barcode: "PT-321654987",
      notes: ["Compatible with multiple printer models", "Order 5 more next week"],
    },
    {
      id: "INV-007",
      name: "Steel Cable",
      description: "1/4 inch galvanized steel cable",
      category: "consumables",
      status: "in-stock",
      quantity: 120,
      minQuantity: 50,
      unit: "m",
      location: "Warehouse B, Rack 7",
      supplier: "CableMaster",
      cost: 2.25,
      lastOrdered: "2023-09-25",
      nextOrder: "2024-03-25",
      barcode: "SC-147258369",
      notes: ["Used for rigging and safety lines", "500m spool - current length remaining: 120m"],
    },
    {
      id: "INV-008",
      name: "Hard Hat",
      description: "ANSI-approved industrial hard hat",
      category: "safety",
      status: "in-stock",
      quantity: 18,
      minQuantity: 10,
      unit: "pcs",
      location: "Safety Locker, Bin 2",
      supplier: "HeadSafe",
      cost: 34.5,
      lastOrdered: "2023-08-15",
      nextOrder: "",
      barcode: "HH-369258147",
      notes: ["Replace every 5 years or after impact", "Current stock expires 2026"],
    },
    {
      id: "INV-009",
      name: "Conveyor Belt",
      description: "Rubber conveyor belt for production line",
      category: "spare-parts",
      status: "on-order",
      quantity: 0,
      minQuantity: 2,
      unit: "m",
      location: "Warehouse A, Rack 12",
      supplier: "BeltTech",
      cost: 125.0,
      lastOrdered: "2023-10-10",
      nextOrder: "2023-10-25",
      barcode: "CB-258369147",
      notes: ["Special order - 10m length", "Expected delivery October 25"],
    },
    {
      id: "INV-010",
      name: "Wrench Set",
      description: "Metric combination wrench set",
      category: "tools",
      status: "in-stock",
      quantity: 4,
      minQuantity: 2,
      unit: "set",
      location: "Tool Crib, Drawer 3",
      supplier: "ToolPro",
      cost: 89.95,
      lastOrdered: "2023-06-20",
      nextOrder: "",
      barcode: "WS-951753864",
      notes: ["10-piece set (8mm-19mm)", "Popular with maintenance team"],
    },
  ]);

  const handleNotifications = () => {
    alert("Showing notifications...");
  };

  const handleImport = () => {
    alert("Import functionality is not yet implemented. This would typically involve uploading a file.");
  };

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case "in-stock":
        return "bg-green-500";
      case "low-stock":
        return "bg-yellow-500";
      case "out-of-stock":
        return "bg-red-500";
      case "on-order":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryIcon = (category: InventoryCategory) => {
    switch (category) {
      case "spare-parts":
        return <FiPackage className="text-blue-500" />;
      case "consumables":
        return <FiLayers className="text-orange-500" />;
      case "tools":
        return <FiTool className="text-purple-500" />;
      case "safety":
        return <FiAlertTriangle className="text-red-500" />;
      case "office":
        return <FiTag className="text-green-500" />;
      default:
        return <FiBox className="text-gray-500" />;
    }
  };

  const openInventoryDetails = (inventoryItem: InventoryItem, editMode: boolean) => {
    setSelectedInventory(inventoryItem);
    setIsEditing(editMode);
    setShowInventoryDetailsModal(true);
  };

  const handleAddInventory = (newInventoryData: Omit<InventoryItem, "id" | "notes">) => {
    const newInventory: InventoryItem = {
      ...newInventoryData,
      id: `INV-${String(inventory.length + 1).padStart(3, "0")}`,
      notes: [],
    };
    setInventory([...inventory, newInventory]);
    setShowAddInventoryModal(false);
  };

  const handleUpdateInventory = (updatedInventoryData: InventoryItem) => {
    setInventory(inventory.map((item) => (item.id === updatedInventoryData.id ? updatedInventoryData : item)));
    setShowInventoryDetailsModal(false);
    setSelectedInventory(null);
    setIsEditing(false);
  };

  const handleRequestOrder = (inventoryItem: InventoryItem) => {
    const updatedItem: InventoryItem = {
      // Explicitly type as InventoryItem
      ...inventoryItem,
      status: "on-order" as InventoryStatus, // Explicit cast to InventoryStatus
      nextOrder: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0],
    };
    setInventory(inventory.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    alert(`Order requested for ${inventoryItem.name}. Next order date set to ${updatedItem.nextOrder}`);
    setShowInventoryDetailsModal(false);
    setSelectedInventory(null);
  };

  const toggleSidebar = () => {
    setHasInteracted(true);
    setSidebarOpen((prev) => !prev);
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const indexOfLastInventory = currentPage * inventoryPerPage;
  const indexOfFirstInventory = indexOfLastInventory - inventoryPerPage;
  const currentInventory = filteredInventory.slice(indexOfFirstInventory, indexOfLastInventory);
  const totalPages = Math.ceil(filteredInventory.length / inventoryPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);

    const fetchData = async () => {
      try {
        const result = await fetchWithAuth("/api/protected-data");
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();

    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [searchQuery, statusFilter, categoryFilter, sidebarOpen]);

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.div
            initial={{ width: isMobile ? 0 : sidebarOpen ? 256 : 80 }}
            animate={{
              width: isMobile ? (sidebarOpen ? 256 : 0) : sidebarOpen ? 256 : 80,
            }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`bg-white border-r border-blue-100 flex flex-col shadow-md overflow-hidden ${isMobile ? "fixed z-50 h-full" : ""}`}
          >
            <div className="p-4 flex items-center justify-between border-b border-blue-100">
              {sidebarOpen ? (
                <>
                  <div className="rounded-lg flex items-center space-x-3">
                    <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
                    <p className="text-blue-600 font-bold">CMMS</p>
                  </div>
                </>
              ) : (
                <img src={logomaintify} alt="Logo Wida" className="h-6 w-auto" />
              )}

              <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200" aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
                {sidebarOpen ? <FiChevronLeft className="text-xl" /> : <FiChevronRight className="text-xl" />}
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
              <NavItem icon={<FiHome />} text="Dashboard" to="/dashboard" expanded={sidebarOpen} />
              <NavItem icon={<FiPackage />} text="Assets" to="/assets" expanded={sidebarOpen} />
              <NavItem icon={<FiClipboard />} text="Work Orders" to="/workorders" expanded={sidebarOpen} />
              <NavItem icon={<FiDatabase />} text="Inventory" to="/inventory" expanded={sidebarOpen} />
              <NavItem icon={<FiBarChart2 />} text="Reports" to="/reports" expanded={sidebarOpen} />
              <NavItem icon={<FiUsers />} text="Team" to="/team" expanded={sidebarOpen} />
              <NavItem icon={<FiSettings />} text="Settings" to="/settings" expanded={sidebarOpen} />
            </nav>

            <div className="p-4 border-t border-blue-100">
              <div className="flex items-center space-x-3">
                <img src="https://placehold.co/40x40/0078D7/FFFFFF?text=AD" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500" />
                {sidebarOpen && (
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">User</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/logout")}
                  className="mt-4 w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  <FiLogOut className="text-xl" />
                  <span>Logout</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-blue-100 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <FiChevronRight className="text-xl" />
              </motion.button>
            )}
            <FiDatabase className="text-2xl text-blue-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Inventory</h2>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun className="text-yellow-400 text-xl" /> : <FiMoon className="text-xl" />}
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNotifications} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative" aria-label="Notifications">
              <FiBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            </motion.button>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
              <img src="https://placehold.co/32x32/0078D7/FFFFFF?text=AD" alt="User Avatar" className="w-8 h-8 rounded-full border border-blue-200" />
              <span className="font-medium text-gray-900 hidden sm:inline">{user?.name}</span>
              <FiChevronDown className="text-gray-500" />
            </motion.div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {/* Header and Actions */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-1">Track and manage all inventory items and supplies</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setShowAddInventoryModal(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiPlus className="text-lg" />
                <span className="font-semibold">Add Item</span>
              </motion.button>

              <motion.button
                onClick={handleImport}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiUpload className="text-lg" />
                <span className="font-semibold">Import</span>
              </motion.button>

              <motion.button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiFilter className="text-lg" />
                <span className="font-semibold">Filters</span>
                {showAdvancedFilters ? <FiChevronUp /> : <FiChevronDown />}
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Items" value={inventory.length.toString()} change="+8%" icon={<FiDatabase />} />
            <StatCard title="In Stock" value={inventory.filter((i) => i.status === "in-stock").length.toString()} change="+5%" icon={<FiCheckCircle />} />
            <StatCard title="Low Stock" value={inventory.filter((i) => i.status === "low-stock").length.toString()} change="+2" icon={<FiAlertTriangle />} />
            <StatCard title="Out of Stock" value={inventory.filter((i) => i.status === "out-of-stock").length.toString()} change="+1" icon={<FiX />} />
          </div>

          {/* Search and Filters */}
          <motion.div layout className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search inventory by name, ID, or description..."
                  className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto"
                  >
                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as InventoryStatus | "all")}
                    >
                      <option value="all">All Statuses</option>
                      <option value="in-stock">In Stock</option>
                      <option value="low-stock">Low Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                      <option value="on-order">On Order</option>
                    </select>

                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as InventoryCategory | "all")}
                    >
                      <option value="all">All Categories</option>
                      <option value="spare-parts">Spare Parts</option>
                      <option value="consumables">Consumables</option>
                      <option value="tools">Tools</option>
                      <option value="safety">Safety Equipment</option>
                      <option value="office">Office Supplies</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Inventory Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {currentInventory.length > 0 ? (
                    currentInventory.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">{getCategoryIcon(item.category)}</div>
                            <div className="ml-4">
                              <div className="text-base font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-600">{item.id}</div>
                              <div className="text-xs text-gray-500 mt-1">{item.description.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm capitalize text-gray-900">
                            {item.category
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span whileHover={{ scale: 1.05 }} className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(item.status)} text-white shadow-sm`}>
                            {item.status
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.quantity} {item.unit}
                            {item.status === "low-stock" && <div className="text-xs text-yellow-600">(Min: {item.minQuantity})</div>}
                            {item.status === "out-of-stock" && <div className="text-xs text-red-600">(Min: {item.minQuantity})</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${item.cost.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">per {item.unit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openInventoryDetails(item, false)}
                            className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-200 flex items-center space-x-1"
                            title="View Details"
                          >
                            <FiEye className="text-lg" />
                            <span>View</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openInventoryDetails(item, true)}
                            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-1"
                            title="Edit Item"
                          >
                            <FiEdit className="text-lg" />
                            <span>Edit</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-600 text-lg">
                        No inventory items found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {filteredInventory.length > inventoryPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{indexOfFirstInventory + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastInventory, filteredInventory.length)}</span> of{" "}
                <span className="font-semibold">{filteredInventory.length}</span> results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-blue-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Previous
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm
                      ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50 border border-blue-200"}
                    `}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-blue-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Add Inventory Modal */}
      <Modal isOpen={showAddInventoryModal} onClose={() => setShowAddInventoryModal(false)} title="Add New Inventory Item">
        <AddInventoryForm onAddInventory={handleAddInventory} />
      </Modal>

      {/* View/Edit Inventory Modal */}
      {selectedInventory && (
        <Modal
          isOpen={showInventoryDetailsModal}
          onClose={() => {
            setShowInventoryDetailsModal(false);
            setSelectedInventory(null);
            setIsEditing(false);
          }}
          title={isEditing ? "Edit Inventory Item" : "Inventory Details"}
        >
          <InventoryDetailsForm
            inventory={selectedInventory}
            isEditing={isEditing}
            onSave={handleUpdateInventory}
            onCancel={() => {
              setShowInventoryDetailsModal(false);
              setSelectedInventory(null);
              setIsEditing(false);
            }}
            onRequestOrder={handleRequestOrder}
          />
        </Modal>
      )}
    </div>
  );
};

export default InventoryDashboard;
