# Avatar Models

`RobotExpressive.glb` is the active 3D avatar model. It is the same robot used
by the three.js `webgl_animation_skinning_morph` example.

`ToneAvatarRobot.glb` is a generated fallback from
`scripts/generate-tone-avatar-robot.mjs`, but the frontend currently loads
`RobotExpressive.glb`.

Important runtime hooks:

- Face morph targets on `Head`: `Angry`, `Surprised`, `Sad`
- Attachment bones: `Body`, `Head`, `UpperArm.L`, `LowerArm.L`, `UpperArm.R`,
  `LowerArm.R`, `UpperLeg.L`, `LowerLeg.L`, `UpperLeg.R`, `LowerLeg.R`
- Source clips: `Standing`, `Idle`, `Walking`, `Running`, `Sitting`, `Wave`,
  `Yes`, `No`, `Jump`, `Punch`, `ThumbsUp`, `Dance`, `WalkJump`, `Death`
- Runtime clips derived in `deriveRuntimeClips` (RobotModel.tsx): `SitToMeditate`
  + `Meditate` (from `Sitting`), `WaveLoop` (looping `Wave`, used by friendly),
  `ThumbsUpLoop` (looping `ThumbsUp`, used by confident)

Regenerate the fallback after edits with:

```bash
node scripts/generate-tone-avatar-robot.mjs
```
