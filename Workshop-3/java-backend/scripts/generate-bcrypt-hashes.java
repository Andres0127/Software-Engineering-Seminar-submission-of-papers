import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateBcryptHashes {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("Admin@123: " + encoder.encode("Admin@123"));
        System.out.println("Organizer@123: " + encoder.encode("Organizer@123"));
        System.out.println("Buyer@123: " + encoder.encode("Buyer@123"));
    }
}

