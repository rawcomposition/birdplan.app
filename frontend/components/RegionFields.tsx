import React from "react";
import RegionSelect from "components/RegionSelect";
import Field from "components/Field";
import Button from "components/Button";
import { Input } from "components/ui/input";
import { RegionFieldsValue, requiresSubregion } from "lib/region";

type Props = {
  value: RegionFieldsValue;
  onChange: React.Dispatch<React.SetStateAction<RegionFieldsValue>>;
};

const portalTarget = () => (typeof document !== "undefined" ? document.body : null);

export default function RegionFields({ value, onChange }: Props) {
  const requireSubregion = requiresSubregion(value.country?.value);

  const toggleButton = (
    <Button
      color="link"
      onClick={() => onChange((v) => ({ ...v, isManualRegion: !v.isManualRegion }))}
      className="text-xs"
    >
      {value.isManualRegion ? "Choose from list" : "Enter manually"}
    </Button>
  );

  return (
    <>
      {!value.isManualRegion && (
        <>
          <Field label="Country / region" rightButton={toggleButton}>
            <RegionSelect
              type="country"
              parent="world"
              onChange={(country: any) =>
                onChange((v) => ({ ...v, country, states: undefined, counties: undefined }))
              }
              value={value.country}
              menuPortalTarget={portalTarget()}
            />
          </Field>
          <Field label="State / Province" isOptional={!requireSubregion}>
            <RegionSelect
              type="subnational1"
              parent={value.country?.value || ""}
              onChange={(states: any) => onChange((v) => ({ ...v, states, counties: undefined }))}
              value={value.states}
              menuPortalTarget={portalTarget()}
              isClearable={!requireSubregion}
              isMulti
            />
          </Field>
          {value.states?.length === 1 && (
            <Field label="County" isOptional>
              <RegionSelect
                type="subnational2"
                parent={value.states[0].value}
                onChange={(counties: any) => onChange((v) => ({ ...v, counties }))}
                value={value.counties}
                menuPortalTarget={portalTarget()}
                isClearable
                isMulti
              />
            </Field>
          )}
        </>
      )}
      {value.isManualRegion && (
        <Field label="eBird region code(s), comma separated" rightButton={toggleButton}>
          <Input
            name="manualRegion"
            placeholder="E.g. US-OH-001,US-OH-003"
            value={value.manualRegion}
            onChange={(e: any) => onChange((v) => ({ ...v, manualRegion: e.target.value }))}
          />
        </Field>
      )}
    </>
  );
}
