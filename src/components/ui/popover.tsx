"use client";

import * as React from "react";
import { Popover as RadixPopover } from "radix-ui";
import { cn } from "@/lib/utils";

export const Popover = RadixPopover.Root;
export const PopoverAnchor = RadixPopover.Anchor;

export const PopoverContent =
	React.forwardRef<React.ElementRef<typeof RadixPopover.Content>,
	React.ComponentPropsWithoutRef<typeof RadixPopover.Content>
	>(({ className, sideOffset = 8, ...props }, ref) => (
		<RadixPopover.Portal>
			<RadixPopover.Content
				ref={ref}
				sideOffset={sideOffset}
				className={cn(
					"z-50 w-80 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none",
					"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
					className
				)}
				{...props}
			/>
		</RadixPopover.Portal>
	));
PopoverContent.displayName = "PopoverContent";