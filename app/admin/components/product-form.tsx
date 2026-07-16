"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getProductIcon,
  PRODUCT_ICON_NAMES,
  type ProductIconName,
} from "@/lib/products/icons";
import { createClient } from "@/lib/supabase/client";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  icon: "Apple" as ProductIconName,
};

type ProductFormProps = {
  onCreated?: () => void | Promise<void>;
};

export function ProductForm({ onCreated }: ProductFormProps) {
  const [supabase] = useState(() => createClient());
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const SelectedIcon = getProductIcon(form.icon);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const name = form.name.trim();
    const description = form.description.trim();
    const priceDollars = Number(form.price);

    if (!name) {
      setMessage({ type: "error", text: "Name is required." });
      return;
    }
    if (!Number.isFinite(priceDollars) || priceDollars < 0) {
      setMessage({ type: "error", text: "Enter a valid price (0 or more)." });
      return;
    }

    const price_cents = Math.round(priceDollars * 100);

    setSubmitting(true);
    const { error } = await supabase.from("products").insert({
      name,
      description,
      price_cents,
      icon: form.icon,
      status: "available",
    });
    setSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setForm(emptyForm);
    setMessage({ type: "success", text: `Added “${name}”.` });
    await onCreated?.();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add product</CardTitle>
        <CardDescription>
          One submit creates one inventory row. Fields clear after a successful
          add.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Banana"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="1.50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Fresh yellow banana"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg border">
                <SelectedIcon className="size-5" />
              </div>
              <Select
                value={form.icon}
                onValueChange={(value) => {
                  if (value == null) return;
                  setForm((current) => ({
                    ...current,
                    icon: value as ProductIconName,
                  }));
                }}
              >
                <SelectTrigger className="w-full min-w-48 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_ICON_NAMES.map((iconName) => {
                    const Icon = getProductIcon(iconName);
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <Icon className="size-4" />
                        {iconName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {message ? (
            <p
              className={
                message.type === "error"
                  ? "text-sm text-destructive"
                  : "text-sm text-muted-foreground"
              }
            >
              {message.text}
            </p>
          ) : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Adding…" : "Add product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
