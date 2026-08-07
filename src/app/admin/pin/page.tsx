import { PinPicker, type PinPickerForm } from "@/components/admin/pin-picker";
import { growthForms } from "@/lib/manual/forms/registry";

export default function AdminPinPage() {
  const forms: PinPickerForm[] = growthForms.map((form) => ({
    id: form.id,
    label: form.label,
    file: form.referenceImage?.file ?? null,
    landmarks: form.landmarks.map((landmark) => ({ id: landmark.id, term: landmark.term })),
  }));

  return <PinPicker forms={forms} />;
}
