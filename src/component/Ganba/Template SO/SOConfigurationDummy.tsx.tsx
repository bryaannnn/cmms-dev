import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Users, Mail, Phone, User, Building, Edit, Trash2, Eye, Save, X, History, CheckCircle, AlertCircle, ChevronDown, MapPin, Copy } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  phone?: string;
}

interface OrgNode {
  id: number;
  employeeId: number | null;
  parentId: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Template {
  id: number;
  name: string;
  isActive: boolean;
  nodes: OrgNode[];
  createdAt: string;
}

interface OrganizationData {
  employees: Employee[];
  templates: Template[];
}

const generateDummyData = (): OrganizationData => {
  const employees: Employee[] = [
    { id: 1, name: "Bogus Fixri", email: "bogus@company.com", position: "CEO / Founder", department: "Executive", phone: "+62 812-3456-7890" },
    { id: 2, name: "Multi Hideyat", email: "multi@company.com", position: "Project Manager", department: "Project Management", phone: "+62 813-4567-8901" },
    { id: 3, name: "Lookta Roymadley", email: "lookta@company.com", position: "Project Manager", department: "Project Management", phone: "+62 814-5678-9012" },
    { id: 4, name: "Rijal Jantika", email: "rijal@company.com", position: "Head of Production", department: "Production", phone: "+62 815-6789-0123" },
    { id: 5, name: "Heru", email: "heru@company.com", position: "Design Manager", department: "Design", phone: "+62 816-7890-1234" },
    { id: 6, name: "Fauzan Ardianayeh", email: "fauzan@company.com", position: "QC & Research", department: "Quality Control", phone: "+62 817-8901-2345" },
    { id: 7, name: "Panji Dwi", email: "panji@company.com", position: "UI Designer", department: "Design", phone: "+62 818-9012-3456" },
    { id: 8, name: "Rahan Fixri", email: "rahan@company.com", position: "UI Designer", department: "Design", phone: "+62 819-0123-4567" },
    { id: 9, name: "Iran", email: "iran@company.com", position: "UI Designer", department: "Design", phone: "+62 820-1234-5678" },
    { id: 10, name: "Venison History", email: "venison@company.com", position: "General Setting", department: "Administration", phone: "+62 821-2345-6789" },
  ];

  const template1: Template = {
    id: 1,
    name: "Current Structure",
    isActive: true,
    nodes: [
      { id: 1, employeeId: 1, parentId: null, x: 500, y: 50, width: 280, height: 120 },
      { id: 2, employeeId: 2, parentId: 1, x: 200, y: 220, width: 260, height: 100 },
      { id: 3, employeeId: 3, parentId: 1, x: 500, y: 220, width: 260, height: 100 },
      { id: 4, employeeId: 4, parentId: 1, x: 800, y: 220, width: 260, height: 100 },
      { id: 5, employeeId: 5, parentId: 4, x: 650, y: 370, width: 240, height: 100 },
      { id: 6, employeeId: 6, parentId: 4, x: 950, y: 370, width: 240, height: 100 },
      { id: 7, employeeId: 7, parentId: 5, x: 550, y: 520, width: 220, height: 90 },
      { id: 8, employeeId: 8, parentId: 5, x: 800, y: 520, width: 220, height: 90 },
      { id: 9, employeeId: 9, parentId: 5, x: 675, y: 520, width: 220, height: 90 },
      { id: 10, employeeId: 10, parentId: 3, x: 500, y: 370, width: 240, height: 100 },
    ],
    createdAt: "2024-01-15",
  };

  const template2: Template = {
    id: 2,
    name: "Proposed Structure",
    isActive: false,
    nodes: [
      { id: 1, employeeId: 1, parentId: null, x: 500, y: 50, width: 280, height: 120 },
      { id: 2, employeeId: 2, parentId: 1, x: 300, y: 220, width: 260, height: 100 },
      { id: 3, employeeId: 3, parentId: 1, x: 600, y: 220, width: 260, height: 100 },
      { id: 4, employeeId: 4, parentId: 1, x: 900, y: 220, width: 260, height: 100 },
      { id: 5, employeeId: 5, parentId: 4, x: 800, y: 370, width: 240, height: 100 },
      { id: 6, employeeId: 6, parentId: 4, x: 1050, y: 370, width: 240, height: 100 },
    ],
    createdAt: "2024-01-20",
  };

  return {
    employees,
    templates: [template1, template2],
  };
};

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4" onClick={onClose}>
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${maxWidth} w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-gray-700 transition-colors duration-150">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Toast: React.FC<{
  message: string;
  type: "success" | "error";
  isVisible: boolean;
  onClose: () => void;
}> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          <div className="flex items-center space-x-2">
            {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SOConfiguration: React.FC = () => {
  const [data, setData] = useState<OrganizationData>({ employees: [], templates: [] });
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });
  const [loading, setLoading] = useState(true);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: "",
    email: "",
    position: "",
    department: "",
    phone: "",
  });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const stored = localStorage.getItem("org.structure.v1");
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setData(parsedData);
          const active = parsedData.templates.find((t: Template) => t.isActive);
          setActiveTemplate(active || parsedData.templates[0]);
        } catch {
          const dummyData = generateDummyData();
          setData(dummyData);
          setActiveTemplate(dummyData.templates[0]);
          localStorage.setItem("org.structure.v1", JSON.stringify(dummyData));
        }
      } else {
        const dummyData = generateDummyData();
        setData(dummyData);
        setActiveTemplate(dummyData.templates[0]);
        localStorage.setItem("org.structure.v1", JSON.stringify(dummyData));
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const saveData = useCallback(async (newData: OrganizationData) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    localStorage.setItem("org.structure.v1", JSON.stringify(newData));
    setData(newData);
    setLoading(false);
    showToast("Changes saved successfully", "success");
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, isVisible: true });
  };

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim()) {
      showToast("Please enter a template name", "error");
      return;
    }

    const newTemplate: Template = {
      id: Date.now(),
      name: newTemplateName,
      isActive: false,
      nodes: activeTemplate ? JSON.parse(JSON.stringify(activeTemplate.nodes)) : [],
      createdAt: new Date().toISOString().split("T")[0],
    };

    const newTemplates = data.templates.map((t) => ({ ...t, isActive: false }));
    newTemplates.push(newTemplate);

    const newData = { ...data, templates: newTemplates };
    await saveData(newData);
    setActiveTemplate(newTemplate);
    setShowTemplateModal(false);
    setNewTemplateName("");
  };

  const handleDuplicateTemplate = async (template: Template) => {
    const duplicatedTemplate: Template = {
      id: Date.now(),
      name: `${template.name} (Copy)`,
      isActive: false,
      nodes: JSON.parse(JSON.stringify(template.nodes)),
      createdAt: new Date().toISOString().split("T")[0],
    };

    const newTemplates = [...data.templates, duplicatedTemplate];
    const newData = { ...data, templates: newTemplates };
    await saveData(newData);
    showToast("Template duplicated successfully", "success");
  };

  const handleSetActiveTemplate = async (template: Template) => {
    const newTemplates = data.templates.map((t) => ({
      ...t,
      isActive: t.id === template.id,
    }));

    const newData = { ...data, templates: newTemplates };
    await saveData(newData);
    setActiveTemplate(template);
    setShowVersionHistory(false);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (data.templates.length <= 1) {
      showToast("Cannot delete the only template", "error");
      return;
    }

    const newTemplates = data.templates.filter((t) => t.id !== templateId);
    const newData = { ...data, templates: newTemplates };
    await saveData(newData);

    if (activeTemplate?.id === templateId) {
      const newActive = newTemplates.find((t) => t.isActive) || newTemplates[0];
      setActiveTemplate(newActive);
    }
  };

  const handleAddNode = async (parentId: number | null = null) => {
    if (!activeTemplate) return;

    const newNode: OrgNode = {
      id: Date.now(),
      employeeId: null,
      parentId,
      x: 500,
      y: 300,
      width: 260,
      height: 100,
    };

    const newNodes = [...activeTemplate.nodes, newNode];
    const newTemplates = data.templates.map((t) => (t.id === activeTemplate.id ? { ...t, nodes: newNodes } : t));

    const newData = { ...data, templates: newTemplates };
    await saveData(newData);

    setSelectedNode(newNode);
    setNewEmployee({
      name: "",
      email: "",
      position: "",
      department: "",
      phone: "",
    });
    setShowEditEmployeeModal(true);
  };

  const handleAddSubordinate = async (parentId: number) => {
    if (!activeTemplate) return;

    const parentNode = activeTemplate.nodes.find((n) => n.id === parentId);
    if (!parentNode) return;

    const newNode: OrgNode = {
      id: Date.now(),
      employeeId: null,
      parentId,
      x: parentNode.x,
      y: parentNode.y + 180,
      width: 240,
      height: 100,
    };

    const newNodes = [...activeTemplate.nodes, newNode];
    const newTemplates = data.templates.map((t) => (t.id === activeTemplate.id ? { ...t, nodes: newNodes } : t));

    const newData = { ...data, templates: newTemplates };
    await saveData(newData);

    setSelectedNode(newNode);
    setNewEmployee({
      name: "",
      email: "",
      position: "",
      department: "",
      phone: "",
    });
    setShowEditEmployeeModal(true);
  };

  const handleDeleteNode = async (nodeId: number) => {
    if (!activeTemplate) return;

    const nodeToDelete = activeTemplate.nodes.find((n) => n.id === nodeId);
    if (!nodeToDelete) return;

    const findChildNodes = (parentId: number): number[] => {
      const directChildren = activeTemplate.nodes.filter((n) => n.parentId === parentId).map((n) => n.id);
      const grandChildren = directChildren.flatMap((childId) => findChildNodes(childId));
      return [...directChildren, ...grandChildren];
    };

    const allNodesToDelete = [nodeId, ...findChildNodes(nodeId)];
    const newNodes = activeTemplate.nodes.filter((n) => !allNodesToDelete.includes(n.id));
    const newTemplates = data.templates.map((t) => (t.id === activeTemplate.id ? { ...t, nodes: newNodes } : t));

    const newData = { ...data, templates: newTemplates };
    await saveData(newData);
  };

  const handleEditEmployee = async () => {
    if (!selectedNode || !activeTemplate) return;

    if (newEmployee.name && newEmployee.email && newEmployee.position && newEmployee.department) {
      let newEmployees = [...data.employees];
      let employeeId = selectedNode.employeeId;

      if (employeeId) {
        newEmployees = newEmployees.map((emp) => (emp.id === employeeId ? ({ ...emp, ...newEmployee } as Employee) : emp));
      } else {
        employeeId = Date.now();
        newEmployees.push({
          id: employeeId,
          name: newEmployee.name!,
          email: newEmployee.email!,
          position: newEmployee.position!,
          department: newEmployee.department!,
          phone: newEmployee.phone || "",
        });
      }

      const newNodes = activeTemplate.nodes.map((n) => (n.id === selectedNode.id ? { ...n, employeeId } : n));

      const newTemplates = data.templates.map((t) => (t.id === activeTemplate.id ? { ...t, nodes: newNodes } : t));

      const newData = { ...data, employees: newEmployees, templates: newTemplates };
      await saveData(newData);
      setShowEditEmployeeModal(false);
      setSelectedNode(null);
      setNewEmployee({
        name: "",
        email: "",
        position: "",
        department: "",
        phone: "",
      });
    } else {
      showToast("Please fill all required fields", "error");
    }
  };

  const getEmployee = (employeeId: number | null) => {
    if (!employeeId) return null;
    return data.employees.find((emp) => emp.id === employeeId);
  };

  const getChildren = (nodeId: number) => {
    return activeTemplate?.nodes.filter((n) => n.parentId === nodeId) || [];
  };

  const renderConnections = () => {
    if (!activeTemplate) return null;

    return activeTemplate.nodes.map((node) => {
      if (!node.parentId) return null;

      const parentNode = activeTemplate.nodes.find((n) => n.id === node.parentId);
      if (!parentNode) return null;

      const startX = parentNode.x + parentNode.width / 2;
      const startY = parentNode.y + parentNode.height;
      const endX = node.x + node.width / 2;
      const endY = node.y;

      const midY = (startY + endY) / 2;

      return <path key={`connection-${node.id}`} d={`M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`} stroke="#cbd5e1" strokeWidth="2" fill="none" />;
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.001;
    const newZoom = Math.min(Math.max(0.5, zoom - e.deltaY * zoomSpeed), 2);
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && (e.altKey || e.ctrlKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const filteredEmployees = data.employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !departmentFilter || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(data.employees.map((emp) => emp.department)));

  const NodeCard: React.FC<{ node: OrgNode }> = ({ node }) => {
    const employee = getEmployee(node.employeeId);
    const children = getChildren(node.id);

    return (
      <>
        <motion.div
          className={`absolute bg-white rounded-2xl shadow-lg border-2 cursor-pointer transition-all duration-200 ${editMode ? "cursor-move hover:shadow-xl" : "hover:shadow-xl"} ${
            !employee ? "border-dashed border-amber-400 bg-amber-50" : "border-blue-100"
          }`}
          style={{
            left: node.x,
            top: node.y,
            width: node.width,
            height: node.height,
          }}
          whileHover={{ scale: 1.02 }}
          drag={editMode}
          dragMomentum={false}
          onDragEnd={(event, info) => {
            if (!editMode || !activeTemplate) return;

            const newX = node.x + info.offset.x;
            const newY = node.y + info.offset.y;

            const newNodes = activeTemplate.nodes.map((n) => (n.id === node.id ? { ...n, x: newX, y: newY } : n));

            const newTemplates = data.templates.map((t) => (t.id === activeTemplate.id ? { ...t, nodes: newNodes } : t));

            const newData = { ...data, templates: newTemplates };
            saveData(newData);
          }}
          onClick={(e) => {
            if (!editMode) {
              e.stopPropagation();
              setSelectedNode(node);
              if (employee) {
                setShowEmployeeModal(true);
              } else {
                setNewEmployee({
                  name: "",
                  email: "",
                  position: "",
                  department: "",
                  phone: "",
                });
                setShowEditEmployeeModal(true);
              }
            }
          }}
        >
          <div className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-start space-x-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${employee ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" : "bg-amber-100 text-amber-600"}`}>
                {employee
                  ? employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{employee ? employee.name : "New Position"}</h3>
                <p className="text-sm text-blue-600 font-medium leading-tight truncate">{employee ? employee.position : "Click to assign"}</p>
                <p className="text-xs text-gray-500 leading-tight truncate">{employee ? employee.department : "Unassigned"}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2">
                {employee && (
                  <>
                    <button
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${employee.email}`;
                      }}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    {employee.phone && (
                      <button
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${employee.phone}`;
                        }}
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="flex space-x-1">
                {editMode && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSubordinate(node.id);
                      }}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Add Subordinate"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Position"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        {children.map((child) => (
          <NodeCard key={child.id} node={child} />
        ))}
      </>
    );
  };

  if (loading && !activeTemplate) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading organization structure...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans antialiased">
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col">
        <div className="p-6 border-b border-gray-200/50">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Organization</h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employee..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 text-sm backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Role</label>
            <select
              className="w-full border border-gray-300/50 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent bg-white/50 text-sm backdrop-blur-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredEmployees.map((employee) => (
              <motion.div
                key={employee.id}
                className="p-4 rounded-xl hover:bg-blue-50/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200/50 bg-white/50 backdrop-blur-sm"
                whileHover={{ x: 4, scale: 1.02 }}
                onClick={() => {
                  const node = activeTemplate?.nodes.find((n) => n.employeeId === employee.id);
                  if (node && canvasRef.current) {
                    const container = canvasRef.current;
                    const centerX = node.x + node.width / 2 - container.clientWidth / 2;
                    const centerY = node.y + node.height / 2 - container.clientHeight / 2;

                    setPan({ x: -centerX, y: -centerY });
                    setZoom(1);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{employee.name}</h3>
                    <p className="text-xs text-blue-600 font-medium truncate">{employee.position}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Organization <span className="text-blue-600">Structure</span>
              </h1>
              <p className="text-gray-600 mt-2">Visualize and manage your organizational hierarchy</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="flex items-center space-x-2 bg-white border border-gray-300/50 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50/50 transition-all duration-200 font-semibold text-sm backdrop-blur-sm"
                >
                  <History className="w-4 h-4" />
                  <span>Templates</span>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {showVersionHistory && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-xl z-10"
                    >
                      <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                        <h3 className="font-bold text-gray-900">Organization Templates</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {data.templates.map((template) => (
                          <div key={template.id} className="p-4 border-b border-gray-100/50 last:border-b-0 hover:bg-blue-50/30 transition-colors duration-150">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900">{template.name}</span>
                              {template.isActive && (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">Active</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>
                                {template.nodes.length} positions • {template.createdAt}
                              </span>
                              <div className="flex space-x-2">
                                <button onClick={() => handleDuplicateTemplate(template)} className="text-purple-600 hover:text-purple-800 font-medium" title="Duplicate Template">
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                {!template.isActive && (
                                  <>
                                    <button onClick={() => handleSetActiveTemplate(template)} className="text-blue-600 hover:text-blue-800 font-medium">
                                      Activate
                                    </button>
                                    <button onClick={() => handleDeleteTemplate(template.id)} className="text-red-600 hover:text-red-800 font-medium">
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditMode(!editMode)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 backdrop-blur-sm ${
                  editMode ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg" : "bg-white border border-gray-300/50 text-gray-700 hover:bg-gray-50/50"
                }`}
              >
                {editMode ? (
                  <span className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </span>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-sm shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>New Template</span>
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-blue-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{data.employees.length}</p>
                </div>
                <Users className="text-blue-500 w-8 h-8" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-blue-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Active Template</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{activeTemplate?.name}</p>
                </div>
                <Building className="text-green-500 w-8 h-8" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-blue-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
                <MapPin className="text-purple-500 w-8 h-8" />
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-blue-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Edit Mode</p>
                  <p className={`text-lg font-bold ${editMode ? "text-green-600" : "text-gray-900"}`}>{editMode ? "Active" : "Inactive"}</p>
                </div>
                <Edit className={editMode ? "text-orange-500 w-8 h-8" : "text-gray-400 w-8 h-8"} />
              </div>
            </div>
          </div>
        </div>

        <div
          ref={canvasRef}
          className="flex-1 overflow-hidden bg-gradient-to-br from-blue-50/50 to-indigo-50/50 relative"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isPanning ? "grabbing" : editMode ? "grab" : "default" }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: "0 0",
              transition: isPanning ? "none" : "transform 0.2s ease",
            }}
          >
            <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                </marker>
              </defs>
              {renderConnections()}
            </svg>

            <div className="relative w-full h-full">
              {activeTemplate?.nodes
                .filter((node) => node.parentId === null)
                .map((node) => (
                  <NodeCard key={node.id} node={node} />
                ))}
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex flex-col space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setZoom((prev) => Math.min(prev + 0.1, 2))}
              className="bg-white/90 backdrop-blur-sm border border-gray-300/50 w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-50/90 transition-all duration-200 shadow-lg"
              title="Zoom In"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.5))}
              className="bg-white/90 backdrop-blur-sm border border-gray-300/50 w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-50/90 transition-all duration-200 shadow-lg"
              title="Zoom Out"
            >
              <X className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetView}
              className="bg-white/90 backdrop-blur-sm border border-gray-300/50 w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-50/90 transition-all duration-200 shadow-lg"
              title="Reset View"
            >
              <Eye className="w-5 h-5" />
            </motion.button>
          </div>

          {editMode && (
            <div className="absolute bottom-6 left-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddNode()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 font-semibold"
                title="Add New Position"
              >
                <Plus className="w-6 h-6" />
                <span>Add Position</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Create New Template">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Template Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Enter template name..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddTemplate();
                }
              }}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowTemplateModal(false);
                setNewTemplateName("");
              }}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button onClick={handleAddTemplate} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg">
              Create Template
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEmployeeModal}
        onClose={() => {
          setShowEmployeeModal(false);
          setSelectedNode(null);
        }}
        title="Employee Details"
        maxWidth="max-w-md"
      >
        {selectedNode && getEmployee(selectedNode.employeeId) && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {getEmployee(selectedNode.employeeId)!
                  .name.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{getEmployee(selectedNode.employeeId)!.name}</h3>
                <p className="text-blue-600 font-semibold">{getEmployee(selectedNode.employeeId)!.position}</p>
                <p className="text-gray-600">{getEmployee(selectedNode.employeeId)!.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500">Email Address</label>
                <p className="text-gray-900 font-medium">{getEmployee(selectedNode.employeeId)!.email}</p>
              </div>
              {getEmployee(selectedNode.employeeId)!.phone && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-500">Phone Number</label>
                  <p className="text-gray-900 font-medium">{getEmployee(selectedNode.employeeId)!.phone}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowEmployeeModal(false);
                  setShowEditEmployeeModal(true);
                  setNewEmployee(getEmployee(selectedNode.employeeId)!);
                }}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Details</span>
              </button>
              <button onClick={() => setShowEmployeeModal(false)} className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold">
                <User className="w-5 h-5" />
                <span>Close</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showEditEmployeeModal}
        onClose={() => {
          setShowEditEmployeeModal(false);
          setSelectedNode(null);
          setNewEmployee({ name: "", email: "", position: "", department: "", phone: "" });
        }}
        title={selectedNode?.employeeId ? "Edit Employee Details" : "Assign Employee to Position"}
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newEmployee.name || ""}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address *</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newEmployee.email || ""}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Position *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newEmployee.position || ""}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, position: e.target.value }))}
              placeholder="Enter job position..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Department *</label>
            <select
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newEmployee.department || ""}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, department: e.target.value }))}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newEmployee.phone || ""}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowEditEmployeeModal(false);
                setSelectedNode(null);
                setNewEmployee({ name: "", email: "", position: "", department: "", phone: "" });
              }}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button onClick={handleEditEmployee} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg">
              {selectedNode?.employeeId ? "Update Employee" : "Assign Employee"}
            </button>
          </div>
        </div>
      </Modal>

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))} />
    </div>
  );
};

export default SOConfiguration;
