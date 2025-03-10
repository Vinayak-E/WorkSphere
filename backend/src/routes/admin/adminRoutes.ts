import expres from 'express';
import { container } from 'tsyringe';
import { AdminController } from '../../controllers/Implementation/admin.controller';

const router = expres.Router();
const adminController = container.resolve<AdminController>('AdminController');

router.post('/login', adminController.adminLogin);
router.get('/companiesList', adminController.companiesList);
router.get('/companyRequests', adminController.companyRequests);

router.put(
  '/companiesList/:companyId/status',
  adminController.updateCompanyStatus
);
router.put(
  '/companiesList/:companyId/approve',
  adminController.updateCompanyRequest
);

export default router;
