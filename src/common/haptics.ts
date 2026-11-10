/**
 * A short tick for actions that change device state (VPN on/off) or complete a
 * gesture (pull to refresh). Browsers without the Vibration API, and devices
 * with touch feedback turned off, ignore it.
 */
export function haptic(duration = 10) {
    try { navigator.vibrate?.(duration); } catch { /* not allowed here; feedback is optional */ }
}
