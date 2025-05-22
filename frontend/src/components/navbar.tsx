const LINK = `https://scrollscan.com/address/${process.env.NEXT_PUBLIC_PRIMORDIAL_ADDRESS}`

export default function Navbar() {
  return (
    <div className="flex items-baseline p-4 z-10 flex-wrap">
      <p className="bg-gradient-to-tl from-pink-800 to-white bg-clip-text text-transparent font-bold text-3xl">
        Tumbuh
      </p>

      <div className="ml-4 text-white text-lg font-bold opacity-70 whitespace-nowrap">
        Primordial Experiment 1
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <a
          href={LINK}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3"
        >
          Explore Primordial
        </a>
      </div>
    </div>
  )
}
