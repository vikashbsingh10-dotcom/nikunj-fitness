"use client";

import React, { useState } from "react";
import { Plan } from "@/types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { GymStore } from "@/lib/store";
import { useToast } from "../ui/toast-context";
import { Plus, Check, Edit2 } from "lucide-react";

interface PlansManagerProps {
  plans: Plan[];
  onPlansUpdated: () => void;
}

export function PlansManager({ plans, onPlansUpdated }: PlansManagerProps) {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(1499);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [featuresText, setFeaturesText] = useState("");
  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName("");
    setDescription("");
    setPrice(1499);
    setDurationDays(30);
    setFeaturesText("Gym floor access\nCardio & free weights\nLocker room access");
    setModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description);
    setPrice(plan.price);
    setDurationDays(plan.duration_days);
    setFeaturesText(plan.features?.join("\n") || "");
    setModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price < 0 || durationDays <= 0) {
      toast.error("Invalid form inputs", "Please enter a valid plan name, price, and duration.");
      return;
    }

    setLoading(true);
    try {
      const features = featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      await GymStore.savePlan({
        id: editingPlan?.id,
        name,
        description,
        price: Number(price),
        duration_days: Number(durationDays),
        features,
        is_active: true,
      });

      toast.success(
        editingPlan ? `Plan "${name}" updated!` : `New plan "${name}" created!`,
        `Configured at ${formatCurrency(price)} for ${durationDays} days.`
      );
      setModalOpen(false);
      onPlansUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save plan";
      toast.error("Error saving plan", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Membership Tiers & Pricing</h2>
          <p className="text-xs text-slate-500">
            Define membership duration packages, pricing structures, and facility privileges
          </p>
        </div>
        <Button onClick={openCreateModal} size="sm" className="gap-1.5 self-start sm:self-center">
          <Plus className="h-3.5 w-3.5" />
          Create New Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className="flex flex-col justify-between p-5 border-slate-200/90 hover:border-slate-300 transition-all shadow-xs hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {plan.duration_days} Days
                </span>
                <Badge variant={plan.is_active ? "success" : "secondary"} className="text-[10px]">
                  {plan.is_active ? "Active" : "Archived"}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">{plan.name}</h3>
              <p className="text-xs text-slate-500 mt-1 min-h-[36px]">{plan.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">{formatCurrency(plan.price)}</span>
                  <span className="text-xs text-slate-400">/{plan.duration_days}d</span>
                </div>
              </div>

              {/* Feature bullets */}
              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                {plan.features?.slice(0, 4).map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(plan)}
                className="w-full text-xs h-8 gap-1.5"
              >
                <Edit2 className="h-3 w-3" />
                Edit Plan
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Plan Create/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogHeader>
          <DialogTitle>{editingPlan ? "Edit Membership Plan" : "Create New Membership Plan"}</DialogTitle>
          <DialogDescription>
            Configure plan pricing, validity duration in days, and included amenities.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSavePlan} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Plan Title *</label>
            <Input
              required
              placeholder="e.g. 6-Month Crossfit Access"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Input
              placeholder="Short description of member privileges..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Price (INR ₹) *</label>
              <Input
                required
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="mt-1 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Duration (Days) *</label>
              <Input
                required
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 30)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Key Features / Perks (One per line)
            </label>
            <textarea
              rows={4}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="All access passes&#10;Locker room access&#10;1-on-1 PT Consultation"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Saving..." : editingPlan ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

