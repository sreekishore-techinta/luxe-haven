import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, GripVertical, Check, X } from "lucide-react";
import { toast } from "sonner";
import { API_URL as API } from "@/api_config";

interface SlideCard {
    id: number;
    content: string;
    icon: string | null;
    is_active: number;
    order_index: number;
}

const AdminSlideCards = () => {
    const [cards, setCards] = useState<SlideCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<SlideCard | null>(null);

    const [formData, setFormData] = useState({
        content: "",
        icon: "",
        is_active: 1,
        order_index: 0
    });

    const fetchCards = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/slide_cards/list.php`, { credentials: "include" });
            const json = await res.json();
            if (json.status === "success") {
                setCards(json.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load slide cards");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleOpenForm = (card: SlideCard | null = null) => {
        if (card) {
            setEditingCard(card);
            setFormData({
                content: card.content,
                icon: card.icon || "",
                is_active: card.is_active,
                order_index: card.order_index
            });
        } else {
            setEditingCard(null);
            setFormData({
                content: "",
                icon: "",
                is_active: 1,
                order_index: cards.length + 1
            });
        }
        setIsMenuOpen(true);
    };

    const handleCloseForm = () => {
        setIsMenuOpen(false);
        setEditingCard(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.content.trim()) {
            toast.error("Content is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const url = editingCard
                ? `${API}/slide_cards/update.php`
                : `${API}/slide_cards/create.php`;

            const payload = editingCard
                ? { id: editingCard.id, ...formData }
                : formData;

            const res = await fetch(url, {
                method: "POST", // update and create both handle POST correctly for our API payload JSON logic
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const json = await res.json();

            if (json.status === "success") {
                toast.success(editingCard ? "Slide card updated" : "Slide card created");
                fetchCards();
                handleCloseForm();
            } else {
                toast.error(json.message || "Failed to save slide card");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this slide card?")) return;

        try {
            const res = await fetch(`${API}/slide_cards/delete.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            const json = await res.json();
            if (json.status === "success") {
                toast.success("Slide card deleted");
                fetchCards();
            } else {
                toast.error(json.message);
            }
        } catch (err) {
            toast.error("Failed to delete slide card");
        }
    };

    const handleToggleActive = async (card: SlideCard) => {
        try {
            const res = await fetch(`${API}/slide_cards/update.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: card.id,
                    content: card.content,
                    icon: card.icon,
                    order_index: card.order_index,
                    is_active: card.is_active ? 0 : 1
                })
            });
            const json = await res.json();
            if (json.status === "success") {
                toast.success(`Slide card ${card.is_active ? 'disabled' : 'enabled'}`);
                fetchCards();
            } else {
                toast.error(json.message);
            }
        } catch (err) {
            toast.error("Failed to toggle status");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Slide Cards</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage the moving ticker displayed below the navbar.</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#D4AF37] hover:text-[#0F172A] hover:shadow-lg transition-all"
                >
                    <Plus size={18} strokeWidth={3} /> Add Slide Card
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {cards.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No slide cards found. Click "Add Slide Card" to create one.</div>
                    ) : (
                        cards.map((card) => (
                            <div key={card.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                                <div className="text-slate-300 cursor-move">
                                    <GripVertical size={20} />
                                </div>
                                <div className="flex-1 flex items-center justify-between min-w-0 gap-4">
                                        <div>
                                            <p className="font-bold text-slate-900 truncate uppercase tracking-wider text-sm">{card.content}</p>
                                        </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(card)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                card.is_active 
                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                            }`}
                                        >
                                            {card.is_active ? <><Check size={14}/> Active</> : <><X size={14}/> Disabled</>}
                                        </button>
                                        <button
                                            onClick={() => handleOpenForm(card)}
                                            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors shrink-0"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(card.id)}
                                            className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors shrink-0"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                {editingCard ? "Edit Slide Card" : "New Slide Card"}
                            </h2>
                            <button onClick={handleCloseForm} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                                <X size={20} className="stroke-[3]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                                <input
                                    type="text"
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    placeholder="E.g. Free shipping on orders over ₹4,999"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1 font-medium">Text will automatically be displayed in UPPERCASE on the frontend.</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <label className="relative flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.is_active === 1}
                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A1A1A]"></div>
                                    <span className="ml-3 text-sm font-bold text-slate-700">Active</span>
                                </label>
                            </div>
                            
                            <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={handleCloseForm} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-[#0F172A] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all disabled:opacity-70">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSlideCards;
