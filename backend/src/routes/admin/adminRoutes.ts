import expres from 'express'
import { AdminAuthController } from '../../controllers/admin/admin.auth.controller'
import { AdminService } from '../../services/admin/admin.service'
import { JwtService } from '../../services/jwt.service'
import { AdminRepository } from '../../repositories/admin/adminRepository'
import { CompanyRepository } from '../../repositories/company/companyRepository'

const router = expres.Router()
const  jwtService  = new JwtService()
const adminRepository = new AdminRepository()
const companyRepository = new CompanyRepository
const adminService = new AdminService(jwtService,adminRepository,companyRepository)
const adminAuthController = new AdminAuthController(adminService)


router.post('/login',adminAuthController.adminLogin)
router.get('/companiesList',adminAuthController.companiesList)

router.put('/companiesList/:companyId/status', adminAuthController.updateCompanyStatus);
router.put('/companiesList/:companyId/approve', adminAuthController.updateCompanyRequest);

export default router