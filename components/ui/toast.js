"use client"

import * as React from "react"

export const ToastProvider = React.Fragment

export const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
))
ToastViewport.displayName = "ToastViewport"

const toastVariants = ""

export const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return <div ref={ref} className={className} {...props} />
})
Toast.displayName = "Toast"

export const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <button ref={ref} className={className} {...props} />
))
ToastAction.displayName = "ToastAction"

export const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <button ref={ref} className={className} {...props} />
))
ToastClose.displayName = "ToastClose"

export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
))
ToastTitle.displayName = "ToastTitle"

export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
))
ToastDescription.displayName = "ToastDescription"

export const ToastActionElement = React.Fragment
export const ToastProps = {}
