import expres from 'express';
import { container } from 'tsyringe';
import { AdminController } from '../../controllers/Implementation/admin.controller';
import { SubscriptionController } from '../../controllers/Implementation/subscription.controller';
import { verifyAuth } from '../../middlewares/authMiddleware';

const router = expres.Router();
const adminController = container.resolve<AdminController>('AdminController');
const subscriptionController = container.resolve<SubscriptionController>('SubscriptionController');

router.post('/login', adminController.adminLogin);
router.get('/subscriptions',subscriptionController.getSubscriptions);
router.use(verifyAuth);

router.get('/companiesList', adminController.companiesList);
router.get('/companyRequests', adminController.companyRequests);
router.put('/companiesList/:companyId/status',adminController.updateCompanyStatus);
router.put('/companiesList/:companyId/approve',adminController.updateCompanyRequest);

router.post('/subscriptions',subscriptionController.createSubscription);
router.put('/subscriptions/:id',subscriptionController.updateSubscription);


router.get('/revenue-stats',adminController.getRevenueStats);
router.get('/company/:companyId/payments',adminController.getCompanyPayments);

router.get('/companies/:id', adminController.getCompanyById);


export default router;
