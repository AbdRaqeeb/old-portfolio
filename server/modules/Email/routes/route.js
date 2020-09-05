import { Router } from 'express';
import Email from "../controller/Email";

const { addEntry } = Email;

const router = Router();

router.post('/', addEntry);

export default router;