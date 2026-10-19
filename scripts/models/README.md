# Device models and screens

The coded work cards (`src/components/DeviceScene.astro`) put a published screen tour inside a 3D
device. Models live in `public/motion/models/`, screens in `public/motion/<scene>/`. Each device's
display material, orientation and finish are set in `src/components/device-scene/shared.ts`; model
credits are in the colophon.

## Models

Source GLBs from Sketchfab stay out of git (the `3d models/` folder is ignored). Compress each one
so material names survive, since `shared.ts` finds the display and glass by name:

```bash
npx @gltf-transform/cli optimize "3d models/<source>.glb" public/motion/models/<device>.glb \
  --compress meshopt --texture-compress webp --texture-size 512 --palette false --join false
```

The Galaxy Z Fold8 file shows an unfolded phone in front of a folded one. Drop the folded one first:

```bash
node scripts/models/drop-behind.mjs "3d models/samsung_galaxy_z_fold8.glb" /tmp/fold8-front.glb
npx @gltf-transform/cli optimize /tmp/fold8-front.glb public/motion/models/galaxy-z-fold8.glb \
  --compress meshopt --texture-compress webp --texture-size 512 --palette false --join false
```

## Screens

```bash
node scripts/motion/device-screens.mjs "$PWD"
```

Cuts the CVS.com, Samsung.com and Bespoke screens from images the case studies already publish.
If a crop changes, update the screen's aspect ratio and any tap points in
`src/components/device-scene/tours.ts`.
