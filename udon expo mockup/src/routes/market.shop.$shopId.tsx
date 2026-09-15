import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AppShell } from "@/components/AppShell";
import { PRODUCTS, getPlant, getShop, getZone } from "@/data/expo";

const SearchSchema = z.object({ plant: z.string().optional() });

export const Route = createFileRoute("/market/shop/$shopId")({
  validateSearch: SearchSchema,
  loader: ({ params }) => {
    const shop = getShop(params.shopId);
    if (!shop) throw notFound();
    return { shop };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "ไม่พบร้านค้า" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.shop.name} | ตลาดต้นไม้พืชสวนโลกอุดรธานี`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.shop.about },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.shop.about },
      ],
    };
  },
  component: ShopPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <p className="text-base font-semibold">ไม่พบร้านค้านี้</p>
        <Link to="/market" className="mt-3 inline-block text-sm font-semibold text-primary">
          กลับไปตลาดต้นไม้
        </Link>
      </div>
    </div>
  ),
});

function ShopPage() {
  const { shop } = Route.useLoaderData();
  const { plant: plantId } = Route.useSearch();
  const zone = getZone(shop.zoneId);
  const featured = plantId ? getPlant(plantId) : undefined;
  const items = PRODUCTS.filter((p) => p.shopId === shop.id);
  const featuredProduct = items.find((p) => p.plantId === plantId);
  const [cart, setCart] = useState(0);

  const add = (name: string) => {
    setCart((c) => c + 1);
    toast.success(`เพิ่ม "${name}" ลงตะกร้าแล้ว`);
  };

  return (
    <AppShell title={shop.name} back="/market">
      <div className="relative">
        <img src={shop.banner} alt={shop.name} className="h-40 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <section className="-mt-8 px-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <h1 className="text-lg font-bold">{shop.name}</h1>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-marigold">star</span>
              {shop.rating} ({shop.reviews} รีวิว)
            </span>
            <Link to="/map" search={{ zone: shop.zoneId }} className="text-primary">
              {zone?.nameTh}
            </Link>
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{shop.about}</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => toast.success("ติดตามร้านนี้แล้ว")}
              className="flex-1 rounded-full bg-primary py-2.5 text-[12px] font-semibold text-primary-foreground"
            >
              ติดตามร้าน
            </button>
            <Link
              to="/market"
              className="flex-1 rounded-full border border-primary py-2.5 text-center text-[12px] font-semibold text-primary"
            >
              ดูต้นไม้ชนิดอื่น
            </Link>
          </div>
        </div>
      </section>

      {featured && featuredProduct && (
        <section className="mt-4 px-4">
          <p className="text-[11px] font-semibold text-secondary">ต้นไม้ที่คุณสแกน</p>
          <div className="mt-2 flex gap-3 rounded-2xl border border-secondary/30 bg-secondary-soft/60 p-3">
            <img
              src={featuredProduct.image}
              alt={featuredProduct.name}
              className="size-24 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold leading-snug">{featured.nameTh}</p>
              <p className="truncate text-[11px] italic text-muted-foreground">{featured.sci}</p>
              <p className="mt-1 text-base font-bold text-secondary">
                ฿{featuredProduct.price.toLocaleString()}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => add(featuredProduct.name)}
                  className="rounded-full bg-secondary px-4 py-2 text-[11px] font-semibold text-secondary-foreground"
                >
                  ใส่ตะกร้า
                </button>
                <Link
                  to="/plant/$id"
                  params={{ id: featured.id }}
                  className="rounded-full border border-secondary px-4 py-2 text-[11px] font-semibold text-secondary"
                >
                  ดูข้อมูลต้นไม้
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-5 px-4">
        <h3 className="text-base font-bold">สินค้าในร้าน</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {items.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <div className="p-2">
                <p className="line-clamp-2 text-[12px] font-medium leading-snug">{p.name}</p>
                <p className="mt-1 text-sm font-bold text-secondary">
                  ฿{p.price.toLocaleString()}
                </p>
                <button
                  onClick={() => add(p.name)}
                  className="mt-2 w-full rounded-full bg-primary py-2 text-[11px] font-semibold text-primary-foreground"
                >
                  ใส่ตะกร้า
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {cart > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-md px-4 pb-2">
          <button
            onClick={() => toast.success("ระบบชำระเงินจะเปิดให้บริการเร็ว ๆ นี้")}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary py-3.5 text-sm font-semibold text-secondary-foreground shadow-sheet"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            ดูตะกร้า ({cart})
          </button>
        </div>
      )}
    </AppShell>
  );
}
