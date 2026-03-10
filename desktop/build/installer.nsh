; Skip "Choose Installation Options" (all users vs current user) and go straight to directory selection.
; Force per-machine (all users) install so the mode page is not shown.
!macro customInstallMode
  StrCpy $isForceMachineInstall 1
!macroend
