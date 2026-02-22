"use client";

import { Button } from "@/components/ui/button";
import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export function BookACall() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ "namespace": "15min" });
      cal("ui", { "hideEventTypeDetails": false, "layout": "month_view" });
    })();
  }, [])

  return (
    <p className="text-sm mt-4">
      I am open to new opportunities. You can book a call with me{" "}
      <Button
        data-cal-namespace="15min"
        data-cal-link="sachi-goyal/15min"
        data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
        variant="link"
        className="relative px-0 py-0 font-normal underline underline-offset-2 focus-visible:ring-0 focus-visible:ring-offset-0"
      >
        here
        <div id="pulsing-dot" className="absolute top-[53%] -translate-y-1/2 -right-2 size-1 bg-cyan-600 rounded-full animate-ping" />
      </Button>
    </p>
  )
}
