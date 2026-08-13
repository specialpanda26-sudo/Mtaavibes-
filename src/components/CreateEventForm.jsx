"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, KENYAN_PHONE_REGEX, TIERS } from "@/lib/constants";
import Portal from "./Portal";
import ImageUploader from "./ImageUploader";
import TierBadge from "./TierBadge";

export default function CreateEventForm({ organizerId, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [organizerMpesa, setOrganizerMpesa] = useState("");
  const [posterUrl, setPosterUrl] = useState(null);
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [tiers, setTiers] = useState(
    Object.fromEntries(
      TIERS.map((t) => [t.value, { price: "", description: t.defaultDescription }])
    )
  );
  const [bulkTiers, setBulkTiers] = useState([{ minQuantity: 5, discountPercent: 10, label: "Squad (5)" }]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function addBulkTier() {
    setBulkTiers((b) => [...b, { minQuantity: 5, discountPercent: 10, label: "" }]);
  }
  function removeBulkTier(i) {
    setBulkTiers((b) => b.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Fraud prevention — Section 9 of the build prompt.
    if (KENYAN_PHONE_REGEX.test(description)) {
      setError("Phone numbers are not allowed in descriptions. All payments go through Mtaa Vibes.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          organizer_id: organizerId,
          title,
          description,
          category,
          venue,
          event_date: eventDate,
          organizer_mpesa_number: organizerMpesa,
          poster_url: posterUrl,
          gallery_images: galleryUrls,
          status: "live",
        })
        .select()
        .single();
      if (eventError) throw eventError;

      const tierRows = Object.entries(tiers)
        .filter(([, t]) => t.price)
        .map(([name, t]) => ({
          event_id: event.id,
          tier_name: name,
          price: Number(t.price),
          description: t.description,
        }));
      await supabase.from("event_tiers").insert(tierRows);

      const bulkRows = bulkTiers
        .filter((b) => b.label)
        .map((b) => ({
          event_id: event.id,
          min_quantity: Number(b.minQuantity),
          discount_percent: Number(b.discountPercent),
          label: b.label,
        }));
      if (bulkRows.length) await supabase.from("bulk_discounts").insert(bulkRows);

      onCreated?.(event);
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <form
        onSubmit={handleSubmit}
        className="glass w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-t-[28px] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-medium">Create event</h2>
          <button type="button" onClick={onClose} className="glass h-8 w-8 rounded-full text-secondary">×</button>
        </div>

        <input
          required
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full glass rounded-2xl px-4 py-3 text-[14px] mb-3 outline-none"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full glass rounded-2xl px-4 py-3 text-[14px] mb-3 outline-none"
          rows={3}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full glass rounded-2xl px-4 py-3 text-[14px] mb-3 outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          required
          placeholder="Venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className="w-full glass rounded-2xl px-4 py-3 text-[14px] mb-3 outline-none"
        />
        <input
          required
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full glass rounded-2xl px-4 py-3 text-[14px] mb-5 outline-none"
        />

        <div className="mb-5">
          <ImageUploader
            organizerId={organizerId}
            mode="single"
            label="Poster image"
            value={posterUrl}
            onChange={setPosterUrl}
          />
        </div>

        <div className="mb-5">
          <ImageUploader
            organizerId={organizerId}
            mode="multiple"
            max={6}
            label="Event gallery (concert shots, crowd, dancefloor…)"
            value={galleryUrls}
            onChange={setGalleryUrls}
          />
        </div>

        <p className="text-[13px] font-medium mb-2">Tier pricing (KSh)</p>
        {Object.entries(tiers).map(([name, t]) => (
          <div key={name} className="flex gap-2 mb-2 items-start">
            <div className="w-20 shrink-0 pt-2.5">
              <TierBadge tierName={name} size="sm" animated={false} />
            </div>
            <input
              type="number"
              placeholder="Price"
              value={t.price}
              onChange={(e) =>
                setTiers((prev) => ({ ...prev, [name]: { ...prev[name], price: e.target.value } }))
              }
              className="w-24 glass rounded-2xl px-3 py-2 text-[13px] outline-none"
            />
            <input
              placeholder="Perks"
              value={t.description}
              onChange={(e) =>
                setTiers((prev) => ({ ...prev, [name]: { ...prev[name], description: e.target.value } }))
              }
              className="flex-1 glass rounded-2xl px-3 py-2 text-[13px] outline-none"
            />
          </div>
        ))}

        <p className="text-[13px] font-medium mt-4 mb-2">Bulk discounts</p>
        {bulkTiers.map((b, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <input
              placeholder="Label (e.g. Squad)"
              value={b.label}
              onChange={(e) =>
                setBulkTiers((prev) => prev.map((row, idx) => (idx === i ? { ...row, label: e.target.value } : row)))
              }
              className="flex-1 glass rounded-2xl px-3 py-2 text-[13px] outline-none"
            />
            <input
              type="number"
              placeholder="Qty"
              value={b.minQuantity}
              onChange={(e) =>
                setBulkTiers((prev) => prev.map((row, idx) => (idx === i ? { ...row, minQuantity: e.target.value } : row)))
              }
              className="w-16 glass rounded-2xl px-3 py-2 text-[13px] outline-none"
            />
            <input
              type="number"
              placeholder="%"
              value={b.discountPercent}
              onChange={(e) =>
                setBulkTiers((prev) => prev.map((row, idx) => (idx === i ? { ...row, discountPercent: e.target.value } : row)))
              }
              className="w-16 glass rounded-2xl px-3 py-2 text-[13px] outline-none"
            />
            <button type="button" onClick={() => removeBulkTier(i)} className="text-tertiary">×</button>
          </div>
        ))}
        <button
          type="button"
          onClick={addBulkTier}
          className="text-[13px] font-medium text-secondary mb-5"
        >
          + Add bulk tier
        </button>

        <input
          required
          placeholder="Organizer M-Pesa number"
          value={organizerMpesa}
          onChange={(e) => setOrganizerMpesa(e.target.value)}
          className="w-full glass rounded-2xl px-4 py-3 text-[14px] mb-4 outline-none"
        />

        {error && <p className="text-[12px] text-accentRed mb-3">{error}</p>}

        <button
          disabled={submitting}
          className="w-full rounded-button bg-ink py-3 text-[14px] font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Publishing…" : "Publish event"}
        </button>
      </form>
      </div>
    </Portal>
  );
}
