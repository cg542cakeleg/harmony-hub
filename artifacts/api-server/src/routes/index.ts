import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import calendarRouter from "./calendar";
import photosRouter from "./photos";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(calendarRouter);
router.use(photosRouter);

export default router;
