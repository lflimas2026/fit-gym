import { onRequestPost as __api_auth___path___ts_onRequestPost } from "/home/fernandolima/Documentos/fit-gym/functions/api/auth/[[path]].ts"
import { onRequestGet as __api_exercises_ts_onRequestGet } from "/home/fernandolima/Documentos/fit-gym/functions/api/exercises.ts"
import { onRequestGet as __api_muscles_recovery_ts_onRequestGet } from "/home/fernandolima/Documentos/fit-gym/functions/api/muscles-recovery.ts"
import { onRequestGet as __api_plan_ts_onRequestGet } from "/home/fernandolima/Documentos/fit-gym/functions/api/plan.ts"
import { onRequestPost as __api_plan_ts_onRequestPost } from "/home/fernandolima/Documentos/fit-gym/functions/api/plan.ts"
import { onRequestGet as __api_records_ts_onRequestGet } from "/home/fernandolima/Documentos/fit-gym/functions/api/records.ts"
import { onRequestGet as __api_sync_exercises_ts_onRequestGet } from "/home/fernandolima/Documentos/fit-gym/functions/api/sync-exercises.ts"
import { onRequestGet as __api_workouts_ts_onRequestGet } from "/home/fernandolima/Documentos/fit-gym/functions/api/workouts.ts"
import { onRequestPost as __api_workouts_ts_onRequestPost } from "/home/fernandolima/Documentos/fit-gym/functions/api/workouts.ts"

export const routes = [
    {
      routePath: "/api/auth/:path*",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth___path___ts_onRequestPost],
    },
  {
      routePath: "/api/exercises",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_exercises_ts_onRequestGet],
    },
  {
      routePath: "/api/muscles-recovery",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_muscles_recovery_ts_onRequestGet],
    },
  {
      routePath: "/api/plan",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_plan_ts_onRequestGet],
    },
  {
      routePath: "/api/plan",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_plan_ts_onRequestPost],
    },
  {
      routePath: "/api/records",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_records_ts_onRequestGet],
    },
  {
      routePath: "/api/sync-exercises",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_sync_exercises_ts_onRequestGet],
    },
  {
      routePath: "/api/workouts",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_workouts_ts_onRequestGet],
    },
  {
      routePath: "/api/workouts",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_workouts_ts_onRequestPost],
    },
  ]