import React from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/mock";

export default function Categories() {
  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-24 pt-10">
      <h1 className="mb-7 font-display text-[34px] font-bold">Categories</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.name}
            to="/explore"
            className="rounded-[18px] border border-border p-6"
            style={{ background: "linear-gradient(160deg, #121218, #191922)" }}
          >
            <div className="mb-4 font-display text-[18px] font-semibold">{c.name}</div>
            <div className="text-[13px] text-mutedDim">{c.count} tier lists</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
