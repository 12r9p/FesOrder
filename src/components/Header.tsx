'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu, BarChart, UtensilsCrossed, ClipboardList, SmartphoneNfc } from 'lucide-react'
import logo from '@/public/logo.png'

export default function Header() {
    const pathname = usePathname()
    const [eventName, setEventName] = useState('')
    const [circleName, setCircleName] = useState('')
    const [userEmail, setUserEmail] = useState('')

    useEffect(() => {
        const getCookieValue = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        };

        const circleId = getCookieValue('circleId');
        const circleName = getCookieValue('circleName');
        const eventName = getCookieValue('eventName');

        if (circleId && circleName && eventName) {
            setCircleName(circleName);
            setEventName(eventName);
        } else {
            setCircleName('');
            setEventName('');
        }
    }, []);

    const navItems = [
        { href: '/register', icon: <SmartphoneNfc className="mr-2 h-4 w-4" />, label: 'Register' },
        { href: '/dashboard/sales', icon: <BarChart className="mr-2 h-4 w-4" />, label: 'Sales Dashboard' },
        { href: '/dashboard/menus', icon: <UtensilsCrossed className="mr-2 h-4 w-4" />, label: 'Menu Management' },
        { href: '/dashboard/orders', icon: <ClipboardList className="mr-2 h-4 w-4" />, label: 'Order Management' },
    ]


    return (
        <header className="flex items-center justify-between p-4 bg-black text-white">
            <div className="flex items-center space-x-4">
                {eventName && circleName ? (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <nav className="flex flex-col space-y-4 mt-6">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={`${item.href}`}
                                        className="flex items-center text-sm hover:text-gray-300"
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                ) : null}
                <div >
                    <Image src={logo} alt="FesOrder Logo" width={40} height={40} />
                </div>
                <h1 className="text-xl font-bold">FesOrder</h1>
                {eventName && circleName && (
                    <>
                        <span className="text-sm">{circleName}</span>
                    </>
                )}
            </div>
        </header>
    )
}