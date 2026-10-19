# Device models and screens

The coded work cards (`src/components/DeviceScene.astro`) arrange two or so 3D devices, each playing
a published screen tour or holding a published screen (`src/components/device-scene/arrangements.ts`). Models live in `public/motion/models/`, screens in `public/motion/<scene>/`. Each device's
display material, orientation and finish are set in `src/components/device-scene/shared.ts`; model
credits are in the colophon.

## Models

Source GLBs from Sketchfab stay out of git (the `3d models/` folder is ignored). Compress each one
so material names survive, since `shared.ts` finds the display and glass by name. Keep
`--simplify false`: optimize's default simplification drops triangles and leaves jagged, broken
shading on the laptops' hinges and rounded edges.

```bash
npx @gltf-transform/cli optimize "3d models/<source>.glb" public/motion/models/<device>.glb \
  --compress meshopt --texture-compress webp --texture-size 512 --palette false --join false --simplify false
```

The Galaxy Z Fold8 file shows an unfolded phone in front of a folded one; each becomes its own
device. Split the file first, keeping the front (unfolded) or back (folded) phone:

```bash
node scripts/models/drop-behind.mjs "3d models/samsung_galaxy_z_fold8.glb" /tmp/fold8-front.glb front
npx @gltf-transform/cli optimize /tmp/fold8-front.glb public/motion/models/galaxy-z-fold8.glb \
  --compress meshopt --texture-compress webp --texture-size 512 --palette false --join false --simplify false
node scripts/models/drop-behind.mjs "3d models/samsung_galaxy_z_fold8.glb" /tmp/fold8-back.glb back
npx @gltf-transform/cli optimize /tmp/fold8-back.glb public/motion/models/galaxy-z-fold8-folded.glb \
  --compress meshopt --texture-compress webp --texture-size 512 --palette false --join false --simplify false
```

## Screens

```bash
node scripts/motion/device-screens.mjs "$PWD"
```

Cuts the CVS.com, Samsung.com and Bespoke screens from images the case studies already publish.
If a crop changes, update the screen's aspect ratio and any tap points in
`src/components/device-scene/tours.ts`.
