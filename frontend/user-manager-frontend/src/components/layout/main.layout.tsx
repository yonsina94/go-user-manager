import type { ReactNode } from "react";

export function MainLayout({children}:{children:ReactNode}){
    return(
        <div className="flex flex-wrap">
            <aside className="flex-col"></aside>
            <main className="flex-row">
                {children}
            </main>
        </div>
    )
}