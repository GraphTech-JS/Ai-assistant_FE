"use client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToasterProps = React.ComponentProps<typeof ToastContainer>;

const Toaster = ({ ...props }: ToasterProps) => {
  return <ToastContainer autoClose={4000} position="top-center" {...props} />;
};

export { Toaster, toast };
