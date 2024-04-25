import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_admin/_dashboard')({
  beforeLoad () {
    console.log("!");
  }
})