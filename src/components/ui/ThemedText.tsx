import { cn } from "@/utils";
import React from "react";

export type textEnum =
  | "title"
  | "subtitle"
  | "text"
  | "empty"
  | "medium"
  | "text_button_yellow"
  | "text_button"
  | "table"
  | "text_about";

export type ThemedTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  type?: textEnum;
  className?: string;
};

export function ThemedText({
  type = "text",
  className = "",
  ...rest
}: ThemedTextProps) {
  return (
    <span
      className={cn(`
        ${
          type === "text" &&
          "text-[14px] md:text-[18px] lg:text-[24px] font-normal font-jost text-white"
        }
        ${
          type === "medium" &&
          "text-[16px] md:text-[20px] lg:text-[28px] font-medium font-jost text-white"
        }
        ${
          type === "table" &&
          "text-[14px] md:text-[18px] lg:text-[24px] font-medium font-jost text-black leading-none"
        }
        ${
          type === "title" &&
          "text-[16px] md:text-[24px] lg:text-[32px] font-normal font-jersey25 text-white leading-none"
        }
        ${
          type === "subtitle" &&
          "text-[14px] md:text-[18px] lg:text-[24px] font-normal font-jersey25 text-white leading-none"
        }
        ${
          type === "text_button" &&
          "text-[14px] md:text-[16px] lg:text-[20px] font-normal font-jost leading-none"
        }
        ${
          type === "text_about" &&
          "text-[10px] md:text-[14px] lg:text-[16px] font-normal font-jost text-black leading-none"
        }
        ${type === "empty" && ""}
        ${className}
      `)}
      {...rest}
    />
  );
}
