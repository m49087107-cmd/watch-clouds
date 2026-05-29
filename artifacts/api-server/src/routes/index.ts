import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import moviesRouter from "./movies";
import watchlistRouter from "./watchlist";
import reviewsRouter from "./reviews";
import tmdbRouter from "./tmdb";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(moviesRouter);
router.use(watchlistRouter);
router.use(reviewsRouter);
router.use(tmdbRouter);
router.use(adminRouter);

export default router;
